import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import { DateTimeScalar } from './scalars.js';

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

export async function log(
  area: string,
  action: string,
  message: Record<string, unknown>,
  target?: string,
  user?: { uid: string },
) {
  // eslint-disable-next-line no-console
  console.log(`<${area}> ${action} ${target ? `on ${target}: ` : ''}${JSON.stringify(message)}`);
  await prisma.logEntry.create({
    data: {
      area,
      action,
      message: JSON.stringify(message),
      target,
      user: user ? { connect: { uid: user.uid } } : undefined,
    },
  });
}

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
