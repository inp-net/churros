import { builder, ENV, log, prisma, sendMail } from '#lib';
import {
  emailLoginPrismaClauses,
  InvalidAuthProviderError,
  PASSWORD_RESET_EXPIRES_AFTER,
} from '#modules/users';
import { AuthProvider } from '@churros/db/prisma';
import { addSeconds } from 'date-fns';
import { ZodError } from 'zod';
import { AuthProvider } from '@churros/db/prisma'

// TODO rename to request-password-reset
builder.mutationField('createPasswordReset', (t) =>
  t.field({
    type: 'Boolean',
    description:
      "Démarre une procédure de réinitialisation de mot de passe pour l'utilisateur associé à l'adresse e-mail ou l'uid fournie. Renvoie `true` même si l'utilisateur n'existe pas.",
    errors: { types: [Error, ZodError, InvalidAuthProviderError] },
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
      if (owner.authProviders.length > 0 && !owner.authProviders.includes(AuthProvider.Local)) {
        throw new InvalidAuthProviderError(owner.authProviders);
      }
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
        ENV.PUBLIC_FRONTEND_ORIGIN,
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
