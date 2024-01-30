import { TYPENAMES_TO_ID_PREFIXES, builder, prisma, purgeUserSessions } from '#lib';

import { GraphQLError } from 'graphql';

builder.mutationField('validateEmail', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      token: t.arg.string(),
    },
    async resolve(_, { token }) {
      const id = `${TYPENAMES_TO_ID_PREFIXES['EmailChange']!}:${token.toLowerCase()}`;
      // prisma errors out if the email validation is not found
      const { email, user, pending } = await prisma.emailChange.findUniqueOrThrow({
        where: { id },
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
      purgeUserSessions(user.uid);
      await prisma.emailChange.update({
        where: { id },
        data: { pending: false },
      });
      return true;
    },
  }),
);
