import { CredentialType } from '@prisma/client';
import { prisma } from '../prisma.js';
import { addSeconds } from 'date-fns';
import { hash } from 'argon2';
import { createTransport } from 'nodemailer';
import { ID_PREFIXES_TO_TYPENAMES, builder } from '../builder.js';

const TYPENAMES_TO_ID_PREFIXES = Object.fromEntries(
  Object.entries(ID_PREFIXES_TO_TYPENAMES).map(([k, v]) => [v, k])
) as Record<
  typeof ID_PREFIXES_TO_TYPENAMES[keyof typeof ID_PREFIXES_TO_TYPENAMES],
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
        from: process.env.SUPPORT_EMAIL,
        html: `<p>
        <a href="${url.toString()}">Réinitialiser mon mot de passe</a>
        </p>`,
        text: `Réinitialiser mon mot de passe sur ${url.toString()}`,
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
        include: { user: true },
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
      return true;
    },
  })
);
