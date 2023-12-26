import { builder } from '#lib';
import { DateTimeScalar } from './scalars.js';

/**
 * Maps user input replacement keys (e.g. [prenom]) to their user property keys (e.g. firstName)
 */
export const REPLACE_MAP = {
  'prénom': 'firstName',
  'nom': 'lastName',
  'nom de famille': 'lastName',
  'filière': 'major.shortName',
  'uid': 'uid',
  'promo': 'graduationYear',
  'année': 'yearTier',
} as const;

export const LinkType = builder.prismaNode('Link', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    value: t.exposeString('value'),
    computedValue: t.string({
      resolve({ value }, _, { user }) {
        const removeAccents = (text: string) =>
          text.normalize('NFKD').replaceAll(/[\u0300-\u036F]/g, '');
        const accessKey = (obj: Record<string, unknown>, dotstring: string) => {
          let searchingIn: string | Record<string, unknown> | undefined = obj;

          for (const fragment of dotstring.split('.')) {
            if (!searchingIn) return;
            if (typeof searchingIn === 'string') return searchingIn;

            searchingIn = searchingIn[fragment.trim()] as
              | Record<string, unknown>
              | string
              | undefined;
          }

          return searchingIn as unknown as string;
        };

        const wrapWithNonAccentedKeys = (o: Record<string, string>) =>
          Object.fromEntries(
            Object.entries(o).flatMap(([k, v]) => [
              [k, v],
              [removeAccents(k), v],
            ]),
          );

        for (const [humanKey, databaseKey] of Object.entries(
          wrapWithNonAccentedKeys(REPLACE_MAP),
        )) {
          value = value.replaceAll(
            `[${humanKey}]`,
            encodeURIComponent(accessKey(user ?? {}, databaseKey) ?? '') +
              (databaseKey === 'yearTier' ? 'A' : ''),
          );
        }

        return value;
      },
    }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
  }),
});

export const LinkInput = builder.inputType('LinkInput', {
  fields: (t) => ({
    name: t.field({ type: 'String' }),
    value: t.field({
      type: 'String',
      validate(value) {
        try {
          // eslint-disable-next-line no-new
          new URL(value);
        } catch {
          return false;
        }

        return true;
      },
    }),
  }),
});
