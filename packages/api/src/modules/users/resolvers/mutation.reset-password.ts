import { builder, prisma, purgeUserSessions, resetLdapUserPassword } from '#lib';

import { CredentialType as PrismaCredentialType } from '@prisma/client';
import { hash, verify } from 'argon2';
import { GraphQLError } from 'graphql';
// TODO rename to change-password

builder.mutationField('resetPassword', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      uid: t.arg.string(),
      oldPassword: t.arg.string(),
      newPassword: t.arg.string(),
      disconnectAll: t.arg.boolean(),
    },
    authScopes(_, { uid }, { user }) {
      const result = Boolean(user?.admin || uid === user?.uid);
      if (!result) {
        console.error(
          `Cannot edit password: ${uid} =?= ${user?.uid ?? '<none>'} OR ${JSON.stringify(
            user?.admin,
          )}`,
        );
      }

      return result;
    },
    async resolve(_, { uid, oldPassword, newPassword, disconnectAll }, { user }) {
      const userEdited = await prisma.user.findUniqueOrThrow({
        where: { uid },
        include: {
          major: {
            include: {
              ldapSchool: true,
            },
          },
          credentials: true,
        },
      });

      if (newPassword.length < 8)
        throw new GraphQLError('Le mot de passe doit faire au moins 8 caractères');

      for (const credential of userEdited.credentials.filter(
        (c) => c.type === PrismaCredentialType.Password,
      )) {
        if (await verify(credential.value, oldPassword)) {
          await prisma.user.update({
            where: { id: userEdited.id },
            data: {
              credentials: {
                delete: { id: credential.id },
                create: {
                  type: PrismaCredentialType.Password,
                  value: await hash(newPassword),
                },
              },
            },
          });

          if (userEdited.major?.ldapSchool) {
            try {
              await resetLdapUserPassword(userEdited, newPassword);
            } catch (error) {
              console.error(error);
            }
          }

          await prisma.logEntry.create({
            data: {
              area: 'password-reset',
              action: 'reset',
              target: userEdited.id,
              message: `Reset password for ${userEdited.email}`,
              user: { connect: { id: user?.id } },
            },
          });

          if (disconnectAll) purgeUserSessions(userEdited.uid);

          return true;
        }
      }

      throw new GraphQLError('Mot de passe incorrect');
    },
  }),
);
