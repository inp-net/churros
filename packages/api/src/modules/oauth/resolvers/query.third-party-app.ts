import { builder, ensureHasIdPrefix, prisma } from '#lib';
import {} from '#modules/global';
import {} from '../index.js';

builder.queryField('thirdPartyApp', (t) =>
  t.prismaField({
    type: 'ThirdPartyApp',
    args: {
      id: t.arg.id({
        description: "The third party app's client_id. The 'app:' id prefix is optional.",
      }),
    },
    async resolve(query, _, { id }) {
      return prisma.thirdPartyApp.findUniqueOrThrow({
        ...query,
        where: { id: ensureHasIdPrefix(id, 'ThirdPartyApp') },
      });
    },
  }),
);
