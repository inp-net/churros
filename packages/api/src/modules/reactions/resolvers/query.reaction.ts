import { builder, prisma } from '#lib';

import { ReactionType } from '../index.js';
// TODO split into event.reaction, post.reaction, etc
// or remove it maybe

builder.queryField('reaction', (t) =>
  t.prismaField({
    type: ReactionType,
    args: {
      id: t.arg.id(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(query, _, { id }) {
      return prisma.reaction.findUniqueOrThrow({
        ...query,
        where: { id },
      });
    },
  }),
);
