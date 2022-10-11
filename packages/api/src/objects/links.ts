import { LinkType as LinkPrismaType } from '@prisma/client';
import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';

export const LinkEnumType = builder.enumType(LinkPrismaType, {
  name: 'LinkType',
});

export const LinkType = builder.prismaNode('Link', {
  id: { field: 'id' },
  fields: (t) => ({
    type: t.expose('type', { type: LinkEnumType }),
    value: t.exposeString('value'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
  }),
});

export const LinkInput = builder.inputType('LinkInput', {
  fields: (t) => ({
    type: t.field({ type: LinkEnumType }),
    value: t.field({ type: 'String' }),
  }),
});

builder.queryField('linkTypes', (t) =>
  t.field({ type: [LinkEnumType], resolve: () => Object.keys(LinkPrismaType) as LinkPrismaType[] })
);
