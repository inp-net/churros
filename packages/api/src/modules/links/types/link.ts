import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const LinkType = builder.prismaNode('Link', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    value: t.exposeString('value'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
  }),
});
