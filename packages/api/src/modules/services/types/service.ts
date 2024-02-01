import { builder } from '#lib';

import { LogoSourceTypeEnum } from '../index.js';

export const ServiceType = builder.prismaObject('Service', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    url: t.exposeString('url'),
    description: t.exposeString('description'),
    logo: t.exposeString('logo'),
    logoSourceType: t.expose('logoSourceType', {
      type: LogoSourceTypeEnum,
    }),
    group: t.relation('group', { nullable: true }),
    school: t.relation('school', { nullable: true }),
    studentAssociation: t.relation('studentAssociation', { nullable: true }),
    importance: t.exposeInt('importance'),
  }),
});
