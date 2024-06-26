import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import { PageType } from '../types/page.js';

builder.queryField('page', (t) =>
  t.prismaField({
    type: PageType,
    description:
      'Récupérer une page par son identifiant. Voir aussi `Group.page` et `StudentAssociation.page` pour des queries plus ergonomiques',
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _, { id }) => {
      const page = await prisma.page.findUnique({ ...query, where: { id } });
      if (!page) throw new GraphQLError('Page introuvable');
      return page;
    },
  }),
);
