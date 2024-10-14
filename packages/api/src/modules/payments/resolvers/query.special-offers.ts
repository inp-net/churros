import { builder, prisma } from '#lib';

builder.queryField('specialOffers', (t) =>
  t.field({
    type: ['String'],
    description: 'Identifiants des différentes promotions existantes',
    resolve: async () => {
      return await prisma.promotion
        .findMany({
          select: { id: true },
        })
        .then((promotions) => promotions.map(({ id }) => id));
    },
  }),
);
