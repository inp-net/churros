import { builder, ensureHasIdPrefix, log, prisma } from '#lib';
import { notify } from '#modules/notifications';
import type { Prisma } from '@churros/db/prisma';
import { CredentialType as CredentialPrismaType, NotificationChannel } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { nanoid } from 'nanoid';
import {
  AwaitingValidationError,
  CredentialType,
  emailLoginPrismaClauses,
  needsManualValidation,
  verifyMasterKey,
  verifyPassword,
} from '../index.js';

builder.mutationField('login', (t) =>
  t.prismaField({
    description: 'Logs a user in and returns a session token.',
    type: CredentialType,
    errors: {
      types: [Error, AwaitingValidationError],
      dataField: { grantScopes: ['me', 'login'] },
    },
    args: {
      email: t.arg.string(),
      password: t.arg.string(),
      clientId: t.arg.string({ required: false }),
    },
    async resolve(query, _, { email, password, clientId }, { request }) {
      const userAgent = request.headers.get('User-Agent')?.slice(0, 255) ?? '';
      if (clientId) {
        await log(
          'oauth',
          'login',
          { clientId, email, userAgent },
          ensureHasIdPrefix(clientId, 'ThirdPartyApp'),
        );
      }

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

    if (userCandidate) {
      // Potential security risk, disabled for now
      // if (!userCandidate.emailValidated) {
      //   await log('login', 'fail', {
      //     uidOrEmail,
      //     err: "user's email is not validated yet",
      //     userCandidate,
      //   });

      //   throw new Error(
      //     `Ton adresse email n'est pas encore validée. Vérifie ta boîte mail (${userCandidate.email}), tu a du recevoir un mail de ${process.env.PUBLIC_SUPPORT_EMAIL}.`,
      //   );
      // }

      // eslint-disable-next-line unicorn/no-lonely-if
      if (await verifyPassword(userCandidate.password, password)) {
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

          await notify(await prisma.user.findMany({ where: { admin: true } }), {
            title: `${userCandidate.email} est bloqué dans une étape intermédiaire`,
            body: "Il a un userCandidate mais pas de user, alors qu'aucune validation manuelle n'est nécéssaire.",
            data: {
              channel: NotificationChannel.Other,
              goto: `/signups/edit/${userCandidate.email}`,
              group: undefined,
            },
          });

          throw new Error("Ton compte n'est pas encore prêt. Réessaie plus tard.");
        }
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

  await log(
    'login',
    'fail',
    {
      uidOrEmail,
      err: 'no hash matches given password',
    },
    user.id,
  );
  throw new Error('Identifiants invalides.');
}
