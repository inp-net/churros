import { builder } from '#lib';
import { DateTimeScalar, Email, MarkdownScalar, PhoneNumber } from '#modules/global';

export const UserProfileInput = builder.inputType('UserProfileInput', {
  description: "Champs constituant le profil d'un·e utilisateur·ice",
  fields: (t) => ({
    firstName: t.string({ required: false, validate: { minLength: 1 } }),
    lastName: t.string({ required: false, validate: { minLength: 1 } }),
    otherEmails: t.field({ type: [Email], required: false }),
    birthday: t.field({
      type: DateTimeScalar,
      required: false,
      description: "Date d'anniversaire. Pour supprimer une date existante, utiliser unsetBirthday",
    }),
    unsetBirthday: t.boolean({
      required: false,
      description: "Supprimer une date d'anniversaire existante",
    }),
    address: t.string({
      description: 'Pour effacer: `""`',
      required: false,
      validate: { maxLength: 255 },
    }),
    phone: t.field({
      type: PhoneNumber,
      description: 'Pour effacer, mettre unsetPhone à `true`',
      required: false,
      validate: { maxLength: 255 },
    }),
    unsetPhone: t.boolean({
      required: false,
      description: 'Supprimer le numéro de téléphone',
    }),
    nickname: t.string({
      description: 'Pour effacer: `""`',
      required: false,
      validate: { maxLength: 255 },
    }),
    description: t.field({
      type: MarkdownScalar,
      required: false,
      validate: { maxLength: 10_000 },
    }),
  }),
});
