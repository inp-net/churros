import { builder } from '#lib';
import { PicturedInterface } from '#modules/global';

export const SchoolType = builder.prismaObject('School', {
  interfaces: [PicturedInterface],
  fields: (t) => ({
    id: t.exposeID('id'),
    uid: t.exposeString('uid'),
    slug: t.exposeString('uid'),
    name: t.exposeString('name'),
    color: t.exposeString('color'),
    studentAssociations: t.relation('studentAssociations'),
    description: t.exposeString('description'),
    address: t.exposeString('address'),
    services: t.relation('services'),
    studentMailDomain: t.exposeString('studentMailDomain'),
    aliasMailDomains: t.exposeStringList('aliasMailDomains'),
    pictureFile: t.exposeString('pictureFile'),
  }),
});
