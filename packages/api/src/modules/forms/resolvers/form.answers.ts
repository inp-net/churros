import { builder, prisma } from '#lib';
import { AnswerType } from '../types/answer.js';
import { FormType } from '../types/form.js';
import { canSeeAllAnswers } from '../utils/permissions.js';

builder.prismaObjectField(FormType, 'answers', (t) =>
  t.prismaConnection({
    description: 'Réponses au formulaire',
    type: AnswerType,
    cursor: 'id',
    authScopes(form, {}, { user }) {
      return canSeeAllAnswers(form, form.event, user);
    },
    resolve: async (query, { id }) => {
      return prisma.answer.findMany({
        ...query,
        where: { question: { section: { formId: id } } },
        orderBy: [
          {
            questionId: 'asc',
          },
        ],
      });
    },
  }),
);
