import { builder, prisma } from '#lib';

import { RegistrationType } from '../index.js';
// TODO rename to booking

builder.queryField('registration', (t) =>
  t.prismaField({
    type: RegistrationType,
    errors: {},
    args: {
      id: t.arg.id(),
    },
    async resolve(query, _, { id }) {
      return prisma.registration.findFirstOrThrow({
        ...query,
        where: {
          id: id.toLowerCase(),
        },
        include: {
          lydiaTransaction: true,
        },
      });
    },
  }),
);
