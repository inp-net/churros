import { CredentialType } from '@prisma/client';
import { prisma } from '../prisma.js';
import { addSeconds } from 'date-fns';
import { hash, verify } from 'argon2';
import { createTransport } from 'nodemailer';
import { ID_PREFIXES_TO_TYPENAMES, builder } from '../builder.js';
import { resetLdapUserPassword } from '../services/ldap.js';
import { GraphQLError } from 'graphql';
import { purgeUserSessions } from '../context.js';

const TYPENAMES_TO_ID_PREFIXES = Object.fromEntries(
  Object.entries(ID_PREFIXES_TO_TYPENAMES).map(([k, v]) => [v, k])
) as Record<
  (typeof ID_PREFIXES_TO_TYPENAMES)[keyof typeof ID_PREFIXES_TO_TYPENAMES],
  keyof typeof ID_PREFIXES_TO_TYPENAMES
>;

const transporter = createTransport(process.env.SMTP_URL);

const PASSWORD_RESET_EXPIRES_AFTER = 60 * 60 * 24;

builder.mutationField('createPasswordReset', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      email: t.arg.string(),
    },
    async resolve(_, { email }) {
      const result = await prisma.passwordReset.create({
        data: {
          user: { connect: { email } },
          expiresAt: addSeconds(new Date(), PASSWORD_RESET_EXPIRES_AFTER),
        },
      });

      const url = new URL(
        `login/reset/${result.id.split(':', 2)[1]!.toUpperCase()}`,
        process.env.FRONTEND_ORIGIN
      );

      await transporter.sendMail({
        to: email,
        from: process.env.PUBLIC_SUPPORT_EMAIL,
        html: `<p>
        <a href="${url.toString()}">Réinitialiser mon mot de passe</a>
        </p>`,
        text: `Réinitialiser mon mot de passe sur ${url.toString()}`,
      });

      await prisma.logEntry.create({
        data: {
          area: 'password-reset',
          action: 'create',
          target: result.id,
          message: `Created password reset for ${email}`,
        },
      });
      return true;
    },
  })
);

builder.mutationField('usePasswordReset', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      token: t.arg.string(),
      newPassword: t.arg.string(),
    },
    async resolve(_, { token, newPassword }) {
      const id = `${TYPENAMES_TO_ID_PREFIXES['PasswordReset']!}:${token.toLowerCase()}`;
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
            deleteMany: { OR: [{ type: CredentialType.Password }, { type: CredentialType.Token }] },
            create: {
              type: CredentialType.Password,
              value: await hash(newPassword),
            },
          },
        },
      });
      if (reset.user.major.ldapSchool) {
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
  })
);

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
            user?.admin
          )}`
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
        (c) => c.type === CredentialType.Password
      )) {
        if (await verify(credential.value, oldPassword)) {
          await prisma.user.update({
            where: { id: userEdited.id },
            data: {
              credentials: {
                delete: { id: credential.id },
                create: {
                  type: CredentialType.Password,
                  value: await hash(newPassword),
                },
              },
            },
          });

          if (userEdited.major.ldapSchool) {
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

          if (disconnectAll) 
            purgeUserSessions(userEdited.uid);
          

          return true;
        }
      }

      throw new GraphQLError('Mot de passe incorrect');
    },
  })
);
