import { LinkType as LinkPrismaType } from '@prisma/client';
import { builder } from '../builder.js';

export const LinkEnumType = builder.enumType(LinkPrismaType, {
  name: 'LinkType',
});

export const UserLinkType = builder.prismaObject('UserLink', {
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.expose('type', { type: LinkEnumType }),
    value: t.exposeString('value'),
  }),
});
