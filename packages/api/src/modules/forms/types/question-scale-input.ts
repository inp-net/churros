import { builder } from '#lib';

export const QuestionScaleInput = builder.inputType('QuestionScaleInput', {
  description: 'Options supplémentaires pour les questions de type `Scale`',
  fields: (t) => ({
    minimum: t.int({
      description: 'Valeur minimale',
    }),
    maximum: t.int({
      description: 'Valeur maximale',
    }),
    minimumLabel: t.string({
      description: 'Label de la valeur minimale',
      required: false,
    }),
    maximumLabel: t.string({
      description: 'Label de la valeur maximale',
      required: false,
    }),
  }),
});
