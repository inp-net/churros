import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';

/**
 * Maps user input replacement keys (e.g. [prenom]) to their user property keys (e.g. firstName)
 */
export const REPLACE_MAP = {
  prenom: 'firstName',
  nom: 'lastName',
  uid: 'uid',
} as const;

export const LinkType = builder.prismaNode('Link', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    value: t.exposeString('value'),
    computedValue: t.string({
      resolve({ value }, _, { user }) {
        for (const [humanKey, databaseKey] of Object.entries(REPLACE_MAP))
          value = value.replaceAll(`[${humanKey}]`, encodeURIComponent(user?.[databaseKey] ?? ''));

        return value;
      },
    }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
  }),
});

export const LinkInput = builder.inputType('LinkInput', {
  fields: (t) => ({
    name: t.field({ type: 'String' }),
    value: t.field({ type: 'String' }),
  }),
});
