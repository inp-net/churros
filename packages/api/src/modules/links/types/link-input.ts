import { builder } from '#lib';

export const LinkInput = builder.inputType('LinkInput', {
  fields: (t) => ({
    name: t.string({ validate: { minLength: 1 } }),
    value: t.string({
      validate: {
        url: true,
        refine: [
          // Disallow 'http:/something' and 'https:/something'
          [
            (value) => !/https?:\/[^/]/.test(value),
            {
              message: 'http:/ ou https:/ est un lien invalide (il manque un 2e “/”)',
              path: ['value'],
            },
          ],
        ],
      },
    }),
  }),
});
