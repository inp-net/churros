import { builder } from '#lib';
import { LinkType, REPLACE_MAP } from '../index.js';

builder.objectField(LinkType, 'computedValue', (t) =>
  t.string({
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

      for (const [humanKey, databaseKey] of Object.entries(wrapWithNonAccentedKeys(REPLACE_MAP))) {
        value = value.replaceAll(
          `[${humanKey}]`,
          encodeURIComponent(accessKey(user ?? {}, databaseKey) ?? '') +
            (databaseKey === 'yearTier' ? 'A' : ''),
        );
      }

      return value;
    },
  }),
);
