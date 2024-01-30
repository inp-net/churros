import { builder, prisma } from '#lib';

import { addSeconds } from 'date-fns';
import { createTransport } from 'nodemailer';

import { PASSWORD_RESET_EXPIRES_AFTER } from '../utils/password-resets.js';
// TODO rename to request-password-reset

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
        process.env.FRONTEND_ORIGIN,
      );

      const transporter = createTransport(process.env.SMTP_URL);

      await transporter.sendMail({
        to: email,
        from: process.env.PUBLIC_SUPPORT_EMAIL,
        subject: 'Réinitialisation de votre mot de passe',
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
  }),
);
