import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import { FormType } from '../types/form.js';

builder.queryField('allForms', (t) =>
  t.prismaConnection({
    description: 'Récupère tous les formulaires. Réservé aux admins.',
    cursor: 'id',
    type: FormType,
    authScopes: { admin: true },
    resolve: async (query, _, {}, { user }) => {
      if (!user) throw new GraphQLError("Vous n'êtes pas connecté·e");

      return prisma.form.findMany({ ...query });
    },
  }),
);
