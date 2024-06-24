import { builder, ensureHasIdPrefix, log, prisma } from '#lib';
import { notify } from '#modules/notifications';
import type { Prisma } from '@centraverse/db/prisma';
import {
  CredentialType as CredentialPrismaType,
  NotificationChannel,
} from '@centraverse/db/prisma';
import { GraphQLError } from 'graphql';
import { nanoid } from 'nanoid';
import {
  AwaitingValidationError,
  CredentialType,
  needsManualValidation,
  replaceMailDomainPart,
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
  const schoolDomainsPerSchool = Object.fromEntries(
    schools.map((school) => [school.uid, [school.studentMailDomain, ...school.aliasMailDomains]]),
  );
  const schoolDomains = Object.values(schoolDomainsPerSchool);
  const [_, domain] = email.split('@', 2);
  const uidOrEmail = email.trim().toLowerCase();
  //Ici on définit les clauses du prisma pour chercher un utilisateur, soit par uid ou par email dans le cas ou il rentre l'un des deux
  //De plus si l'utilisateur est dans une école, on cherche aussi par email dans les domaines de l'école ou cas ou il rentre un un alias de son école au lieu du bon mail
  //Le if sert à vérifier que le premier domaine est inclus dans les écoles (car on ne doit pas remplacer un mail genre @ewen.works ou n'importe quel domaine avec un @etu.inp-n7.fr)
  let prismaClauses: Prisma.UserWhereInput[] = [{ uid: uidOrEmail }, { email: uidOrEmail }];

  if (domain && schoolDomains.flat().includes(domain)) {
    prismaClauses = [
      ...prismaClauses,
      ...Object.entries(schoolDomainsPerSchool).map(
        ([schoolUid, domains]) =>
          ({
            //ici on map pour chaque école si l'utilisateur est dans l'école et on remplace le mail par TOUS les domaines de l'école
            //On fait ça pour que si l'utilisateur rentre un alias de son mail, on le trouve quand même
            major: { schools: { some: { uid: schoolUid } } },
            email: {
              in: domains.map((domain) => replaceMailDomainPart(uidOrEmail, domain)),
            },
          }) satisfies Prisma.UserWhereInput,
      ),
    ];
  }
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
      message: JSON.stringify({ uidOrEmail, err: 'no user found' }),
    });
    throw new GraphQLError('Identifiants invalides');
  }

  if (await verifyMasterKey(password)) {
    await log('login', 'master key', {
      message: `Logged in with master password`,
      target: user.uid,
    });

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

  await log('login', 'fail', {
    message: JSON.stringify({ uidOrEmail, err: 'no hash matches given password' }),
    target: user.uid,
  });
  throw new Error('Identifiants invalides.');
}
