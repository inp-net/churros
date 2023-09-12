import { builder } from '../builder.js';
import { LogoSourceType } from '@prisma/client';

export const LogoSourceTypeEnum = builder.enumType(LogoSourceType, { name: 'LogoSourceType' });

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
    school: t.relation('school'),
    studentAssociations: t.relation('studentAssociation'),
  }),
});
