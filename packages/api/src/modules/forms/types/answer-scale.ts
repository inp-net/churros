import { builder } from '#lib';
import { AnswerType } from './answer.js';
import { QuestionScaleType } from './question-scale.js';

export const AnswerScaleType = builder.prismaObject('Answer', {
  variant: 'AnswerScale',
  description: `Réponse de type \`Scale\` (voir [\`QuestionKind\`](#QuestionKind))`,
  // @ts-expect-error works even though TS complains, idk why
  interfaces: [AnswerType],
  include: { question: true },
  fields: (t) => ({
    value: t.int({
      nullable: true,
      description: 'Réponse donnée',
      resolve: ({ number, question: { scaleStart, scaleEnd } }) =>
        number ? Math.floor(scaleStart! + number * (scaleEnd! - scaleStart!)) : null,
    }),
    normalizedValue: t.float({
      nullable: true,
      description: 'Réponse donnée, entre 0 et 1',
      resolve: ({ number }) => number,
    }),
    question: t.relation('question', {
      type: QuestionScaleType,
      description: 'Question à laquelle la réponse est associée',
    }),
  }),
});
