import { builder } from '#lib';
import { ColorScalar, Email, MarkdownScalar, UIDScalar } from '#modules/global';

export const GroupProfileInput = builder.inputType('GroupProfileInput', {
  description: "Les champs du profil d'un groupe",
  fields: (t) => ({
    name: t.string({ required: false, validate: { minLength: 1, maxLength: 50 } }),
    shortDescription: t.string({ required: false, validate: { maxLength: 255 } }),
    longDescription: t.field({ type: MarkdownScalar, required: false }),
    room: t.string({ required: false, validate: { maxLength: 255 } }),
    relatedGroups: t.field({ type: [UIDScalar], required: false }),
    color: t.field({ type: ColorScalar, required: false }),
    unsetColor: t.boolean({ required: false, description: 'Supprimer la couleur du groupe' }),
    // TODO use mailto: links for that
    email: t.field({ type: Email, required: false }),
    unsetEmail: t.boolean({ required: false, description: 'Supprimer l’adresse email du groupe' }),
  }),
});
