import { builder } from '#lib';
import { AnswerType } from './answer.js';
import { QuestionScalarType } from './question-scalar.js';

export const AnswerTextType = builder.prismaObject('Answer', {
  variant: 'AnswerText',
  description: `Réponse de type \`Text\` (voir [\`QuestionKind\`](#QuestionKind))`,
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
