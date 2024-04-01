import { builder } from '#lib';
import { normalizeScaleAnswer } from '../utils/answers.js';
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
      resolve: ({ answer, question: { scaleStart, scaleEnd } }) => {
        if (scaleStart === null || scaleEnd === null) return Number.parseInt(answer[0]!);

        const normalized = normalizeScaleAnswer(answer);
        if (normalized === undefined) return Number.parseInt(answer[0]!);

        const scaleWidth = scaleEnd! - scaleStart!;
        return Math.floor(normalized * scaleWidth + scaleStart);
      },
    }),
    normalizedValue: t.float({
      nullable: true,
      description: 'Réponse donnée, entre 0 et 1',
      resolve: ({ answer }) => normalizeScaleAnswer(answer),
    }),
    question: t.relation('question', {
      type: QuestionScaleType,
      description: 'Question à laquelle la réponse est associée',
    }),
  }),
});
