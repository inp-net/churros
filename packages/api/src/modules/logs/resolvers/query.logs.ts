import { builder, prisma } from '#lib';

import { GraphQLError } from 'graphql';
import { LogType } from '../index.js';

builder.queryField('logs', (t) =>
  t.prismaConnection({
    type: LogType,
    cursor: 'id',
    authScopes(_, {}, { user }) {
      if (!user) throw new GraphQLError('User not found');
      return Boolean(user.admin);
    },
    async resolve(query, _, {}, { user: me }) {
      if (!me) throw new GraphQLError('User not found');
      return prisma.logEntry.findMany({
        ...query,
        include: {
          user: true,
        },
        orderBy: {
          happenedAt: 'desc',
        },
      });
    },
  }),
);
