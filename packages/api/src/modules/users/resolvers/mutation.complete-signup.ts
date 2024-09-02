import { builder, log, prisma, yearTier } from '#lib';
import { notify } from '#modules/notifications';
import {
  CredentialType,
  NotificationChannel,
  Prisma,
  type Major,
  type UserCandidate,
} from '@churros/db/prisma';
import { upsertLdapUser } from '@inp-net/ldap7/user';
import { addDays } from 'date-fns';
import { GraphQLError } from 'graphql';
import omit from 'lodash.omit';
import { nanoid } from 'nanoid';
import { completeRegistration } from '../index.js';
import { SignupCompletionResultType } from '../types/signup-completion-result.js';

builder.mutationField('completeSignup', (t) =>
  t.field({
    type: SignupCompletionResultType,
    args: {
      token: t.arg.string(),
    },
    async resolve(_, { token }, { request }) {
      const candidate = await prisma.userCandidate.findUniqueOrThrow({
        where: { token },
      });
      await log(
        'signups',
        'complete',
        { candidate: omit(candidate, 'churrosPassword', 'ldapPassword'), token },
        candidate.id,
      );
      const user = await completeRegistration(
        await prisma.userCandidate.update({
          where: { token },
          data: {
            emailValidated: true,
          },
          include: {
            major: { include: { schools: true } },
            usingQuickSignup: { include: { school: { include: { majors: true } } } },
          },
        }),
      ).catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')
          throw new GraphQLError("Cette demande d'inscription est déjà complétée ou inexistante.");

        throw error;
      });
      const userOrCandidate: (typeof user | UserCandidate) & { major?: Major | undefined | null } =
        user ??
        (await prisma.userCandidate.findUniqueOrThrow({
          where: { token },
          include: { major: true },
        }));

      const needsVerification = !user;

      const adminsResponsibleForThisSignup = await prisma.user.findMany({
        where: {
          OR: [
            { admin: true },
            ...(userOrCandidate.majorId
              ? [
                  {
                    adminOfStudentAssociations: {
                      some: {
                        school: {
                          majors: {
                            some: { id: userOrCandidate.majorId },
                          },
                        },
                      },
                    },
                  },
                ]
              : []),
          ],
        },
      });

      // The !candidate.emailValidated conditions prevents sending the notificaiton
      // on subsequent completeSignup requests for the same user candidate
      if (needsVerification && !candidate.emailValidated) {
        await notify(adminsResponsibleForThisSignup, {
          title: `Inscription en attente de validation`,
          body: `${userOrCandidate.email} (${userOrCandidate.firstName} ${userOrCandidate.lastName}, ${
            userOrCandidate.graduationYear ? yearTier(userOrCandidate.graduationYear) : '?'
          }A ${userOrCandidate.major?.shortName ?? 'sans filière'}) a fait une demande d'inscription`,
          data: {
            channel: NotificationChannel.Other,
            goto: `/signups/edit/${userOrCandidate.email}`,
            group: undefined,
          },
        });
      }

      const authToken = needsVerification
        ? null
        : await prisma.credential.create({
            data: {
              type: CredentialType.Token,
              userId: user.id,
              value: nanoid(),
              userAgent: request.headers.get('User-Agent')?.slice(0, 255) ?? '',
              expiresAt: addDays(new Date(), 1),
            },
          });

      try {
        await upsertLdapUser({
          uid: userOrCandidate.uid,
          firstName: userOrCandidate.firstName,
          lastName: userOrCandidate.lastName,
          email: [userOrCandidate.email],
          password: 'ldapPassword' in userOrCandidate ? userOrCandidate.ldapPassword : undefined,
        });
      } catch (error) {
        console.error('Failed to create LDAP user', error);
        log(
          'signups',
          'ldap/enroll',
          { error, user: omit(user, 'churrosPassword', 'ldapPassword') },
          userOrCandidate.id,
        );
      }

      return {
        needsManualValidation: needsVerification,
        token: authToken ?? undefined,
      };
    },
  }),
);
