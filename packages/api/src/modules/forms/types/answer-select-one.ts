import { builder } from '#lib';
import { AnswerType } from './answer.js';
import { QuestionSelectOneType } from './question-select-one.js';

export const AnswerSelectOneType = builder.prismaObject('Answer', {
  variant: 'AnswerSelectOne',
  description: `Réponse de type \`SelectOne\` (voir [\`QuestionKind\`](#QuestionKind))`,
  // @ts-expect-error works even though TS complains, idk why
  interfaces: [AnswerType],
  fields: (t) => ({
    value: t.string({
      nullable: true,
      description: 'Réponse donnée',
      resolve: ({ answer }) => answer[0],
    }),
    question: t.relation('question', {
      type: QuestionSelectOneType,
      description: 'Question à laquelle la réponse est associée',
    }),
  }),
});
