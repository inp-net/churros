import { builder, log, prisma, sendMail } from '#lib';
import { emailLoginPrismaClauses } from '#modules/users/utils';
import { addSeconds } from 'date-fns';
import { PASSWORD_RESET_EXPIRES_AFTER } from '../utils/password-resets.js';

// TODO rename to request-password-reset
builder.mutationField('createPasswordReset', (t) =>
  t.field({
    type: 'Boolean',
    description:
      "Démarre une procédure de réinitialisation de mot de passe pour l'utilisateur associé à l'adresse e-mail ou l'uid fournie. Renvoie `true` même si l'utilisateur n'existe pas.",
    errors: {},
    args: {
      email: t.arg.string(),
    },
    async resolve(_, { email }) {
      const schools = await prisma.school.findMany();
      const owner = await prisma.user.findFirst({
        where: {
          OR: emailLoginPrismaClauses(schools, email).clauses,
        },
      });
      if (!owner) return true;
      const result = await prisma.passwordReset.create({
        data: {
          user: {
            connect: {
              id: owner.id,
            },
          },
          expiresAt: addSeconds(new Date(), PASSWORD_RESET_EXPIRES_AFTER),
        },
      });

      const url = new URL(
        `login/reset/${result.id.split(':', 2)[1]!.toUpperCase()}`,
        process.env.PUBLIC_FRONTEND_ORIGIN,
      );

      await sendMail(
        'reset-password',
        email,
        {
          resetLink: url.toString(),
        },
        {},
      );

      await log('password-reset', 'create', {
        target: result.id,
        owner,
        url,
        message: `Created password reset for ${email}`,
      });
      return true;
    },
  }),
);
