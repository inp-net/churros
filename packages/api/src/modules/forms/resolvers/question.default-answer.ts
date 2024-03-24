import { builder } from '#lib';
import { AnswerType } from '../types/answer.js';
import { QuestionType } from '../types/question.js';

builder.prismaInterfaceField(QuestionType, 'defaultAnswer', (t) =>
  t.field({
    type: AnswerType,
    nullable: true,
    description:
      'La réponse par défaut à cette question. Si le résultat est bien de type Answer, le champ `id` est vide',
    async resolve({ defaultAnswer, defaultNumber, id }) {
      if (defaultAnswer.length === 0 && defaultNumber === null) return null;
      return {
        id: '',
        answer: defaultAnswer,
        bookingId: null,
        number: defaultNumber,
        createdAt: new Date(),
        createdById: null,
        questionId: id,
      };
    },
  }),
);
