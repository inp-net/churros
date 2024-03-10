import { builder } from '#lib';
import { AnswerType } from './answer.js';
import { QuestionScalarType } from './question-scalar.js';

export const AnswerLongTextType = builder.prismaObject('Answer', {
  variant: 'AnswerLongText',
  description: `Réponse de type \`LongText\` (voir [\`QuestionKind\`](#QuestionKind))`,
  // @ts-expect-error works even though TS complains, idk why
  interfaces: [AnswerType],
  fields: (t) => ({
    value: t.field({
      type: 'String',
      nullable: true,
      description: 'Réponse donnée',
      resolve: ({ answer }) => answer[0],
    }),
    question: t.relation('question', {
      type: QuestionScalarType,
      description: 'Question à laquelle la réponse est associée',
    }),
  }),
});
