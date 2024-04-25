import { builder } from '#lib';
import { parse } from 'date-fns';
import { DateTimeScalar } from '../../global/types/date-time.js';
import { AnswerType } from './answer.js';
import { QuestionScalarType } from './question-scalar.js';

export const AnswerTimeType = builder.prismaObject('Answer', {
  variant: 'AnswerTime',
  description: `Réponse de type \`Time\` (voir [\`QuestionKind\`](#QuestionKind))`,
  // @ts-expect-error works even though TS complains, idk why
  interfaces: [AnswerType],
  fields: (t) => ({
    answer: t.variant(AnswerType),
    value: t.field({
      type: DateTimeScalar,
      nullable: true,
      description: 'Réponse donnée',
      resolve: ({ answer }) => (answer[0] ? parse(answer[0], 'HH:mm:ss', new Date()) : null),
    }),
    rawValue: t.field({
      type: 'String',
      nullable: true,
      description: 'Réponse donnée, brute (sous forme de texte)',
      resolve: ({ answer }) => answer[0],
    }),
    question: t.relation('question', {
      type: QuestionScalarType,
      description: 'Question à laquelle la réponse est associée',
    }),
  }),
});
