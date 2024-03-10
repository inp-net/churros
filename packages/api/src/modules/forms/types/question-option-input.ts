import { builder } from '#lib';

export const QuestionOptionInputType = builder.inputType('QuestionOptionInput', {
  description: 'Choix pour les questions de type `SelectOne` ou `SelectMultiple`',
  fields: (t) => ({
    value: t.string({
      description: 'Choix',
    }),
    jump: t.id({
      description: 'ID de la question vers laquelle sauter si ce choix est sélectionné',
      required: false,
    }),
  }),
});
