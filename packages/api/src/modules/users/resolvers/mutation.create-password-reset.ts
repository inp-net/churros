import { builder, prisma, sendMail } from '#lib';
import { addSeconds } from 'date-fns';
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

      await sendMail(
        'reset-password',
        email,
        {
          resetLink: url.toString(),
        },
        {},
      );

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
