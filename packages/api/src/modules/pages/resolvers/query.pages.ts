import { builder, prisma } from '#lib';
import { PageType } from '../index.js';

builder.queryField('pages', (t) =>
  t.prismaConnection({
    description: 'Récupère toutes les pages existantes. Réservé aux administrateur·ice.s.',
    type: PageType,
    cursor: 'id',
    authScopes: { admin: true },
    resolve: async (query) =>
      prisma.page.findMany({
        orderBy: { createdAt: 'desc' },
        ...query,
      }),
  }),
);
