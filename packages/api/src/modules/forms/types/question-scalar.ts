import { builder } from '#lib';
import { QuestionType } from './question.js';

export const QuestionScalarType = builder.prismaObject('Question', {
  variant: 'QuestionScalar',
  // @ts-expect-error works even though TS complains, idk why
  interfaces: [QuestionType],
  description: 'Question de type `Text`, `Number`, `Date`, `Time` ou `LongText`',
});
