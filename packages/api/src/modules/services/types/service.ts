import { builder } from '#lib';

import { LogoSourceTypeEnum } from '../index.js';

export const ServiceType = builder.prismaNode('Service', {
  id: { field: 'id' },
  fields: (t) => ({
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
