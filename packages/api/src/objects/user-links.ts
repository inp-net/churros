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

export const UserLinkInput = builder.inputType('UserLinkInput', {
  fields: (t) => ({
    type: t.field({ type: LinkEnumType }),
    value: t.field({ type: 'String' }),
  }),
});

builder.queryField('linkTypes', (t) =>
  t.field({ type: [LinkEnumType], resolve: () => Object.keys(LinkPrismaType) as LinkPrismaType[] })
);
