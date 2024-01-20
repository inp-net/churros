import { TYPENAMES_TO_ID_PREFIXES, builder, prisma, resetLdapUserPassword } from '#lib';

import { CredentialType as PrismaCredentialType } from '@prisma/client';
import { hash } from 'argon2';
// TODO maybe rename to reset-password
// OR merge with mutation.change-password

builder.mutationField('usePasswordReset', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      token: t.arg.string(),
      newPassword: t.arg.string(),
    },
    async resolve(_, { token, newPassword }) {
      const id = `${TYPENAMES_TO_ID_PREFIXES.PasswordReset!}:${token.toLowerCase()}`;
      const reset = await prisma.passwordReset.findUniqueOrThrow({
        where: { id },
        include: {
          user: {
            include: {
              major: {
                include: {
                  ldapSchool: true,
                },
              },
            },
          },
        },
      });

      if (reset.expiresAt && reset.expiresAt.valueOf() < Date.now())
        throw new Error('Password reset is expired');

      await prisma.passwordReset.deleteMany({ where: { user: { id: reset.user.id } } });

      await prisma.user.update({
        where: { id: reset.user.id },
        data: {
          credentials: {
            deleteMany: {
              OR: [{ type: PrismaCredentialType.Password }, { type: PrismaCredentialType.Token }],
            },
            create: {
              type: PrismaCredentialType.Password,
              value: await hash(newPassword),
            },
          },
        },
      });
      if (reset.user.major?.ldapSchool) {
        try {
          await resetLdapUserPassword(reset.user, newPassword);
        } catch (error) {
          console.error(error);
        }
      }

      await prisma.logEntry.create({
        data: {
          area: 'password-reset',
          action: 'use',
          target: reset.id,
          message: `Used password reset for ${reset.user.email}`,
        },
      });
      return true;
    },
  }),
);
