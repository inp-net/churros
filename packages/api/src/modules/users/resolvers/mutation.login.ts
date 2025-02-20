import { builder, log, prisma } from '#lib';
import { queueNotification } from '#modules/notifications';
import type { Prisma } from '@churros/db/prisma';
import { AuthProvider, CredentialType as CredentialPrismaType } from '@churros/db/prisma';
import { hashPassword, upsertLdapUser } from '@inp-net/ldap7/user';
import { Event as NotellaEvent } from '@inp-net/notella';
import { GraphQLError } from 'graphql';
import { nanoid } from 'nanoid';
import {
  AwaitingValidationError,
  CredentialType,
  emailLoginPrismaClauses,
  InvalidAuthProviderError,
  needsManualValidation,
  verifyMasterKey,
  verifyPassword,
} from '../index.js';

builder.mutationField('login', (t) =>
  t.prismaField({
    description: 'Logs a user in and returns a session token.',
    type: CredentialType,
    errors: {
      types: [Error, AwaitingValidationError, InvalidAuthProviderError],
      dataField: { grantScopes: ['me', 'login'] },
    },
    args: {
      email: t.arg.string(),
      password: t.arg.string(),
      clientId: t.arg.string({ required: false }),
    },
    async resolve(query, _, { email, password }, { request }) {
      const userAgent = request.headers.get('User-Agent')?.slice(0, 255) ?? '';

      return login(email, password, userAgent, query);
    },
  }),
);

export async function login(
  email: string,
  password: string,
  userAgent: string,
  query: {
    include?: Prisma.CredentialInclude;
    select?: Prisma.CredentialSelect;
  },
) {
  const schools = await prisma.school.findMany();
  const { clauses: prismaClauses, uidOrEmail } = emailLoginPrismaClauses(schools, email);
  const user = await prisma.user.findFirst({
    where: { OR: prismaClauses },
    include: {
      credentials: {
        where: {
          type: CredentialPrismaType.Password,
        },
      },
      major: {
        include: {
          ldapSchool: true,
          schools: {
            select: { uid: true },
          },
        },
      },
      contributions: {
        include: {
          option: {
            include: {
              paysFor: true,
            },
          },
        },
      },
    },
  });

  if (user && user.authProviders.length > 0 && !user?.authProviders.includes(AuthProvider.Local)) {
    await log('login', 'fail', {
      uidOrEmail,
      err: 'user has authProviders but not Local',
      user,
    });

    throw new InvalidAuthProviderError(user.authProviders);
  }

  if (!user) {
    const userCandidate = await prisma.userCandidate.findFirst({
      where: {
        email: uidOrEmail,
      },
      include: {
        major: {
          include: {
            schools: true,
          },
        },
        usingQuickSignup: {
          include: {
            school: {
              include: {
                majors: true,
              },
            },
          },
        },
      },
    });

    if (userCandidate && (await verifyPassword(userCandidate.churrosPassword, password))) {
      if (needsManualValidation(userCandidate)) {
        await log('login', 'fail-awaiting-validation', {
          uidOrEmail,
          err: 'user is awaiting validation',
          userCandidate,
        });

        throw new AwaitingValidationError();
      } else {
        await log('login', 'fail-stuck-in-limbo', {
          uidOrEmail,
          err: 'user does not need manual validation but no user was created from the userCandidate',
          userCandidate,
        });

        await queueNotification({
          title: `${userCandidate.email} est bloqué·e dans une étape intermédiaire`,
          body: "Il a un userCandidate mais pas de user, alors qu'aucune validation manuelle n'est nécéssaire.",
          action: `/signups/edit/${userCandidate.email}`,
          object_id: userCandidate.id,
          event: NotellaEvent.LoginStuck,
        });

        throw new GraphQLError("Ton compte n'est pas encore prêt. Réessaie plus tard.");
      }
    }

    await log('login', 'fail', {
      uidOrEmail,
      err: 'no user found',
    });
    throw new GraphQLError('Identifiants invalides');
  }

  if (await verifyMasterKey(password)) {
    await log('login', 'master key', { message: `Logged in with master password` }, user.uid);

    return prisma.credential.create({
      ...query,
      data: {
        userId: user.id,
        type: CredentialPrismaType.Token,
        value: nanoid(),
        userAgent,
        // Keep the token alive for a year
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const credentials = await prisma.credential.findMany({
    where: { type: CredentialPrismaType.Password, user: { id: user.id } },
  });

  for (const { value, userId } of credentials) {
    if (await verifyPassword(value, password)) {
      // update the user's password in the new ldap, unless it's a bot
      if (!user.bot) {
        try {
          await upsertLdapUser({
            firstName: user.firstName,
            lastName: user.lastName,
            uid: user.uid,
            email: [user.email, ...user.otherEmails],
            password: hashPassword(password),
            school: user.major?.schools.map((school) => school.uid) ?? [],
          });
        } catch (error) {
          await log(
            'login',
            'fail',
            {
              uidOrEmail,
              err: 'failed to update user in ldap',
              ldapErr: error,
            },
            uidOrEmail,
          );
        }
      }

      if (userId && !user.authProviders.includes(AuthProvider.Local)) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            authProviders: { push: AuthProvider.Local },
          },
        });
      }

      return prisma.credential.create({
        ...query,
        data: {
          userId,
          type: CredentialPrismaType.Token,
          value: nanoid(),
          userAgent,
          // Keep the token alive for a year
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  throw new Error('Identifiants invalides.');
}
