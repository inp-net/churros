import { builder, createLdapUser, freeUidValidator, prisma, yearTier } from '#lib';
import { DateTimeScalar, UIDScalar } from '#modules/global';
import { notify } from '#modules/notifications';
import { NotificationChannel, Prisma, type Major, type UserCandidate } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';
import { completeRegistration, hashPassword, UserCandidateType, UserType } from '../index.js';
// TODO rename registration to signup

builder.mutationField('completeRegistration', (t) =>
  t.field({
    type: builder.unionType('CompleteSignupResult', {
      types: [UserCandidateType, UserType],
      resolveType: (value) =>
        Object.hasOwn(value, 'usingQuickSignup') ? UserCandidateType : UserType,
    }),
    errors: { types: [ZodError] },
    args: {
      token: t.arg.string(),
      firstName: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      lastName: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      uid: t.arg({
        type: UIDScalar,
        validate: [freeUidValidator],
      }),
      majorId: t.arg.id({ required: false }),
      graduationYear: t.arg.int({ validate: { min: 1900, max: 2100 } }),
      birthday: t.arg({ type: DateTimeScalar, required: false }),
      phone: t.arg.string({ validate: { maxLength: 255 } }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
      password: t.arg.string({ validate: { minLength: 8, maxLength: 255 } }),
      passwordConfirmation: t.arg.string({ validate: {} }),
      cededImageRightsToTVn7: t.arg.boolean(),
      apprentice: t.arg.boolean(),
    },
    validate: [
      ({ password, passwordConfirmation }) => password === passwordConfirmation,
      { path: ['passwordConfirmation'], message: 'Les mots de passe ne correspondent pas.' },
    ],
    // @ts-expect-error FIXME typescript can't infer that the return type is a union
    async resolve(
      _,
      {
        token,
        firstName,
        lastName,
        majorId,
        uid,
        graduationYear,
        address,
        birthday,
        phone,
        password,
        cededImageRightsToTVn7,
        apprentice,
      },
    ) {
      await prisma.logEntry.create({
        data: {
          action: 'complete',
          area: 'signups',
          message: `Complétion de l'inscription de ${firstName} ${lastName} ${yearTier(
            graduationYear,
          ).toString()}A ${phone}`,
          target: `token ${token}`,
        },
      });
      const user = await completeRegistration(
        await prisma.userCandidate.update({
          where: { token },
          data: {
            emailValidated: true,
            uid,
            address,
            birthday,
            firstName,
            majorId,
            graduationYear,
            lastName,
            phone,
            password: await hashPassword(password),
            cededImageRightsToTVn7,
            apprentice,
          },
          include: {
            major: { include: { schools: true } },
            usingQuickSignup: { include: { school: { include: { majors: true } } } },
          },
        }),
      ).catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')
          throw new GraphQLError("Cette demande d'inscription déjà complétée ou inexistante.");

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

      await notify(adminsResponsibleForThisSignup, {
        title: needsVerification ? `Inscription en attente de validation` : `Nouvelle inscription!`,
        body:
          `${userOrCandidate.email} (${userOrCandidate.firstName} ${userOrCandidate.lastName}, ${
            userOrCandidate.graduationYear ? yearTier(userOrCandidate.graduationYear) : '?'
          }A ${userOrCandidate.major?.shortName ?? 'sans filière'}) ` +
          (needsVerification ? `a fait une demande d'inscription` : `s'est inscrit·e!`),
        data: {
          channel: NotificationChannel.Other,
          goto: needsVerification ? `/signups/edit/${userOrCandidate.email}` : `/@${user.uid}`,
          group: undefined,
        },
      });

      if (user?.major && user.major.ldapSchool) {
        try {
          await createLdapUser({ ...user, otherEmails: [] }, password);
        } catch (error) {
          console.error(error);
        }
      }

      return userOrCandidate;
    },
  }),
);
