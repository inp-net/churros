import { builder } from '#lib';
import type { Answer, Question, QuestionKind } from '@prisma/client';
import { parse } from 'date-fns';
import { DateTimeScalar } from '../../global/types/date-time.js';
import { AnswerType } from './answer.js';
import {
  QuestionFileUploadType,
  QuestionScalarType,
  QuestionScaleType,
  QuestionSelectMultipleType,
  QuestionSelectOneType,
} from './question-variants.js';

function createAnswerVariant<T, U, Q>(
  name: `Answer${QuestionKind}`,
  type: U,
  questionType: Q,
  resolver: (values: Answer & { question: Question }) => T,
) {
  return builder.prismaObject('Answer', {
    variant: name,
    description: `Réponse de type \`${name.replace(/^Answer/, '')}\` (voir [\`QuestionKind\`](#QuestionKind))`,
    interfaces: [AnswerType],
    // @ts-expect-error TODO: fix type
    isTypeOf: ({ question: { type } }) => type === (name.replace(/^Answer/, '') as QuestionKind),
    fields: (t) => ({
      value: t.field({
        // @ts-expect-error TODO: fix type
        type,
        nullable: true,
        description: 'Réponse donnée',
        // @ts-expect-error TODO: fix type
        resolve: (values) => resolver(values),
      }),
      question: t.relation('question', {
        // @ts-expect-error TODO: fix type
        type: questionType,
        description: 'Question à laquelle la réponse est associée',
      }),
    }),
  });
}

export const AnswerTextType = createAnswerVariant(
  'AnswerText',
  'String',
  QuestionScalarType,
  ({ answer }) => answer[0],
);

export const AnswerLongTextType = createAnswerVariant(
  'AnswerLongText',
  'String',
  QuestionScalarType,
  ({ answer }) => answer[0],
);

export const AnswerSelectOneType = createAnswerVariant(
  'AnswerSelectOne',
  'String',
  QuestionSelectOneType,
  ({ answer }) => answer[0],
);

builder.prismaObjectField(AnswerSelectOneType, 'isOther', (t) =>
  t.boolean({
    description: 'Indique si la réponse a été donnée avec l\'option "Autre"',
    // @ts-expect-error TODO: fix type
    resolve: ({ answer, question }) => answer[0] && !question.options.includes(answer[0]),
  }),
);

export const AnswerSelectMultipleType = createAnswerVariant(
  'AnswerSelectMultiple',
  ['String'],
  QuestionSelectMultipleType,
  ({ answer }) => answer,
);

export const AnswerFileUploadType = createAnswerVariant(
  'AnswerFileUpload',
  'String',
  QuestionFileUploadType,
  ({ answer }) => answer[0] ?? null,
);

export const AnswerScaleType = createAnswerVariant(
  'AnswerScale',
  'Float',
  QuestionScaleType,
  ({ number, question: { scaleStart, scaleEnd } }) =>
    number ? scaleStart! + number * (scaleEnd! - scaleStart!) : null,
);

builder.prismaObjectField(AnswerScaleType, 'normalizedValue', (t) =>
  t.float({
    nullable: true,
    description: "Réponse donnée. De 0 (correspond au minimum de l'échelle) à 1 (maximum)",
    resolve: ({ number }) => number,
  }),
);

export const AnswerDateType = createAnswerVariant(
  'AnswerDate',
  DateTimeScalar,
  QuestionScalarType,
  ({ answer }) => {
    try {
      return answer[0] ? parse(answer[0], 'YYYY-mm-dd', new Date()) : null;
    } catch {
      return null;
    }
  },
);

export const AnswerTimeType = createAnswerVariant(
  'AnswerTime',
  DateTimeScalar,
  QuestionScalarType,
  ({ answer }) => {
    try {
      return answer[0] ? parse(answer[0], 'HH:mm:ss', new Date()) : null;
    } catch {
      return null;
    }
  },
);
