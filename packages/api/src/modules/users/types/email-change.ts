import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const EmailChangeType = builder.prismaObject('EmailChange', {
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeID('userId'),
    email: t.exposeString('email'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    pending: t.exposeBoolean('pending'),
    user: t.relation('user'),
  }),
});
