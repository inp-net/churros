import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const EmailChangeType = builder.prismaNode('EmailChange', {
  id: { field: 'id' },
  fields: (t) => ({
    userId: t.exposeID('userId'),
    email: t.exposeString('email'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    pending: t.exposeBoolean('pending'),
    user: t.relation('user'),
  }),
});
