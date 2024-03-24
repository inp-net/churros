import { builder, prisma } from '#lib';
import { AnswerType } from '../types/answer.js';
import { QuestionType } from '../types/question.js';

builder.prismaInterfaceField(QuestionType, 'myAnswer', (t) =>
  t.prismaField({
    type: AnswerType,
    nullable: true,
    description: "La réponse de l'utilisateur·ice connecté·e à cette question",
    async resolve(query, question, _, { user }) {
      if (!user) return null;
      return prisma.answer.findUnique({
        ...query,
        where: {
          questionId_createdById: {
            questionId: question.id,
            createdById: user.id,
          },
        },
      });
    },
  }),
);
