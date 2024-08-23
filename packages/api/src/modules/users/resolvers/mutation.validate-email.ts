import { builder, prisma, purgeSessionsUser } from '#lib';
import { EmailChangeType } from '#modules/users/types';

import { GraphQLError } from 'graphql';

builder.mutationField('validateEmail', (t) =>
  t.prismaField({
    type: EmailChangeType,
    errors: {},
    args: {
      token: t.arg.string(),
    },
    async resolve(query, _, { token }) {
      // prisma errors out if the email validation is not found
      const { email, user, pending } = await prisma.emailChange.findUniqueOrThrow({
        where: { token },
        include: { user: true },
      });

      if (!pending)
        throw new GraphQLError("Cette demande de changement d'adresse e-mail a déjà été utilisée.");

      if (await prisma.user.findUnique({ where: { email } }))
        throw new GraphQLError('Un autre utilisateur a déjà cette adresse e-mail');

      await prisma.user.update({
        where: { id: user.id },
        data: { email },
      });
      purgeSessionsUser(user.uid);
      return prisma.emailChange.update({
        ...query,
        where: { token },
        data: { pending: false },
      });
    },
  }),
);
