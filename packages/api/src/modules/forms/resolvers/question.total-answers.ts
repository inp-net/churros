import { builder, prisma } from '#lib';
import { QuestionType } from '../types/question.js';
import { canSeeAllAnswers } from '../utils/permissions.js';

builder.prismaInterfaceField(QuestionType, 'totalAnswers', (t) =>
  t.int({
    description: 'Nombre total de réponses à cette question',
    authScopes: (question, _, { user }) =>
      canSeeAllAnswers(question.section.form, question.section.form.event, user),
    resolve: async ({ id }) => prisma.answer.count({ where: { questionId: id } }),
  }),
);
