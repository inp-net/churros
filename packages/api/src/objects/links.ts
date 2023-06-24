import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';

export const LinkType = builder.prismaNode('Link', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    value: t.exposeString('value'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
  }),
});

export const LinkInput = builder.inputType('LinkInput', {
  fields: (t) => ({
    name: t.field({ type: 'String' }),
    value: t.field({ type: 'String' }),
  }),
});
