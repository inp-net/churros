import { builder, prisma, subscriptionName } from '#lib';

import { RegistrationType } from '../index.js';
// TODO rename to booking

builder.queryField('registration', (t) =>
  t.prismaField({
    type: RegistrationType,
    errors: {},
    args: {
      id: t.arg.id(),
    },
    smartSubscription: true,
    subscribe(subs, _, { id }) {
      subs.register(subscriptionName(id.toLowerCase(), 'updated'));
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
