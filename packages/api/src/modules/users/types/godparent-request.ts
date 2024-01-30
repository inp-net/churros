import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const GodparentRequestType = builder.prismaObject('GodparentRequest', {
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    godchild: t.relation('godchild'),
    godparent: t.relation('godparent'),
  }),
});
