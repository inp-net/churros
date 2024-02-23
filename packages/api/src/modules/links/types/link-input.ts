import { builder } from '#lib';

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
