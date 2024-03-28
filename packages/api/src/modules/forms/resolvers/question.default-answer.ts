import { builder } from '#lib';
import { AnswerType } from '../types/answer.js';
import { QuestionType } from '../types/question.js';

builder.prismaInterfaceField(QuestionType, 'defaultAnswer', (t) =>
  t.field({
    type: AnswerType,
    nullable: true,
    description:
      'La réponse par défaut à cette question. Même si le résultat est bien de type Answer, le champ `id` est vide',
    async resolve(question) {
      const { defaultAnswer, id } = question;
      if (defaultAnswer.length === 0) return null;
      return {
        id: '',
        answer: defaultAnswer,
        bookingId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: null,
        questionId: id,
        question,
      };
    },
  }),
);
