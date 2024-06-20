import { builder, ensureHasIdPrefix, prisma } from '#lib';

import type { Prisma } from '@prisma/client';
import { CredentialType as CredentialPrismaType } from '@prisma/client';
import * as argon2 from 'argon2';
import { GraphQLError } from 'graphql';
import { nanoid } from 'nanoid';
import { log } from '../../../lib/logger.js';
import { CredentialType } from '../index.js';

builder.mutationField('login', (t) =>
  t.prismaField({
    description: 'Logs a user in and returns a session token.',
    type: CredentialType,
    errors: { types: [Error], dataField: { grantScopes: ['me', 'login'] } },
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
  const schoolDomain = schools.map((school) => [
    school.uid,
    [school.studentMailDomain, ...school.aliasMailDomains],
  ]);
  const schoolDomains = schoolDomain.flatMap(([_, domains]) => domains);
  const [_, domain] = email.split('@', 2);
  const uidOrEmail = email.trim().toLowerCase();
  //Ici on définit les clauses du prisma pour chercher un utilisateur, soit par uid ou par email dans le cas ou il rentre l'un des deux
  //De plus si l'utilisateur est dans une école, on cherche aussi par email dans les domaines de l'école ou cas ou il rentre un un alias de son école au lieu du bon mail
  //Le if sert à vérifier que le premier domaine est inclus dans les écoles (car on ne doit pas remplacer un mail genre @ewen.works ou n'importe quel domaine avec un @etu.inp-n7.fr)
  let prismaClauses: Prisma.UserWhereInput['OR'] = [{ uid: uidOrEmail }, { email: uidOrEmail }];
  if (schoolDomains.includes(domain)) {
    prismaClauses = [
      ...prismaClauses,
      ...(schoolDomain.map(([schoolUid, domains]) => ({
        //ici on map pour chaque école si l'utilisateur est dans l'école et on remplace le mail par TOUS les domaines de l'école
        //On fait ça pour que si l'utilisateur rentre un alias de son mail, on le trouve quand même
        major: { schools: { some: { uid: schoolUid } } },
        email: {
          in: Array.isArray(domains)
            ? domains.map((domain: string) => uidOrEmail.replace(/@[^@]+$/, `@${domain}`))
            : [uidOrEmail.replace(/@[^@]+$/, `@${domains}`)],
        },
      })) as Prisma.UserWhereInput[]),
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
    await prisma.logEntry.create({
      data: {
        action: 'fail',
        area: 'login',
        message: JSON.stringify({ uidOrEmail, err: 'no user found' }),
      },
    });
    throw new GraphQLError('Identifiants invalides');
  }

  if (
    process.env.MASTER_PASSWORD_HASH &&
    (await argon2.verify(process.env.MASTER_PASSWORD_HASH, password))
  ) {
    await prisma.logEntry.create({
      data: {
        action: 'master key',
        area: 'login',
        message: `Logged in with master password`,
        target: user.uid,
      },
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
    if (await argon2.verify(value, password)) {
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

  await prisma.logEntry.create({
    data: {
      action: 'fail',
      area: 'login',
      message: JSON.stringify({ uidOrEmail, err: 'no hash matches given password' }),
      target: user.uid,
    },
  });
  throw new Error('Identifiants invalides.');
}
