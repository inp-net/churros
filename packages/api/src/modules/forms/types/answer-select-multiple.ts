import { builder } from '#lib';
import { AnswerType } from './answer.js';
import { QuestionSelectMultipleType } from './question-select-multiple.js';

export const AnswerSelectMultipleType = builder.prismaObject('Answer', {
  variant: 'AnswerSelectMultiple',
  description: `Réponse de type \`SelectMultiple\` (voir [\`QuestionKind\`](#QuestionKind))`,
  // @ts-expect-error works even though TS complains, idk why
  interfaces: [AnswerType],
  fields: (t) => ({
    value: t.field({
      type: ['String'],
      nullable: true,
      description: 'Réponse donnée',
      resolve: ({ answer }) => answer,
    }),
    question: t.relation('question', {
      type: QuestionSelectMultipleType,
      description: 'Question à laquelle la réponse est associée',
    }),
  }),
});
