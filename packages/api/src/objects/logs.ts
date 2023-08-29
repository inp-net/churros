import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';
import { prisma } from '../prisma.js';
import { GraphQLError } from 'graphql';

export const LogType = builder.prismaNode('LogEntry', {
  id: { field: 'id' },
  fields: (t) => ({
    happenedAt: t.expose('happenedAt', { type: DateTimeScalar }),
    user: t.relation('user', { nullable: true }),
    area: t.exposeString('area'),
    action: t.exposeString('action'),
    target: t.exposeString('target', { nullable: true }),
    message: t.exposeString('message'),
  }),
});

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
      });
    },
  })
);
