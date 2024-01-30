import { builder } from '#lib';

export const SchoolType = builder.prismaObject('School', {
  fields: (t) => ({
    id: t.exposeID('id'),
    uid: t.exposeString('uid'),
    name: t.exposeString('name'),
    color: t.exposeString('color'),
    studentAssociations: t.relation('studentAssociations'),
    description: t.exposeString('description'),
    address: t.exposeString('address'),
    services: t.relation('services'),
    internalMailDomain: t.exposeString('internalMailDomain'),
  }),
});
