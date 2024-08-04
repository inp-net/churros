import { builder } from '#lib';
import { LooseURL } from '#modules/global';

export const LinkInput = builder.inputType('LinkInput', {
  fields: (t) => ({
    text: t.string({ description: 'Texte à afficher pour le lien' }),
    url: t.field({ type: LooseURL }),
  }),
});
