import { builder, prisma } from '#lib';
import { AnswerType, FormType } from '../types/index.js';

builder.prismaObjectField(FormType, 'myAnswers', (t) =>
  t.prismaField({
    description: "Réponses de l'utilisateur·ice connecté·e à ce formulaire",
    type: [AnswerType],
    authScopes: { loggedIn: true },
    async resolve(query, { id }, {}, { user }) {
      if (!user) return [];

      return prisma.answer.findMany({
        ...query,
        where: {
          question: {
            section: {
              formId: id,
            },
          },
          createdById: user.id,
        },
        orderBy: [
          {
            question: { section: { order: 'asc' } },
          },
          {
            question: { order: 'asc' },
          },
        ],
      });
    },
  }),
);
