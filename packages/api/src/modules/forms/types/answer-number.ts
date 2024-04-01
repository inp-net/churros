import { builder } from '#lib';
import { AnswerType } from './answer.js';
import { QuestionScalarType } from './question-scalar.js';

export const AnswerNumberType = builder.prismaObject('Answer', {
  variant: 'AnswerNumber',
  description: `Réponse de type \`Number\` (voir [\`QuestionKind\`](#QuestionKind))`,
  // @ts-expect-error works even though TS complains, idk why
  interfaces: [AnswerType],
  fields: (t) => ({
    value: t.float({
      nullable: true,
      description: 'Réponse donnée',
      resolve: ({ answer }) => {
        if (answer.length === 0) return null;
        const coerced = Number.parseFloat(answer[0]!);
        if (Number.isNaN(coerced)) return null;
        return coerced;
      },
    }),
    question: t.relation('question', {
      type: QuestionScalarType,
      description: 'Question à laquelle la réponse est associée',
    }),
  }),
});
