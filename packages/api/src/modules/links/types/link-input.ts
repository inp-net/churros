import { builder } from '#lib';
import { URLScalar } from '#modules/global';

export const LinkInput = builder.inputType('LinkInput', {
  fields: (t) => ({
    text: t.string({ description: 'Texte à afficher pour le lien' }),
    url: t.field({ type: URLScalar }),
  }),
});
