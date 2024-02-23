import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';

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
