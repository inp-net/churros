import { builder, prisma } from '#lib';

import { ReactionType } from '../index.js';
// TODO split into event.reactions, post.reactions, etc

builder.queryField('reactions', (t) =>
  t.prismaConnection({
    type: ReactionType,
    cursor: 'id',
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(query) {
      return prisma.reaction.findMany({
        ...query,
        orderBy: { createdAt: 'asc' },
      });
    },
  }),
);
