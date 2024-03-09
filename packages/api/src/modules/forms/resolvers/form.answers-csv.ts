import { builder, prisma, toCsv } from '#lib';
import {} from '#modules/global';
import { fullName } from '#modules/users';
import {} from '../index.js';
import { FormType } from '../types/form.js';
import { canSeeAllAnswers } from '../utils/permissions.js';

builder.prismaObjectField(FormType, 'answersCsv', (t) =>
  t.string({
    authScopes({ event, createdById }, {}, { user }) {
      return canSeeAllAnswers({ createdById }, event, user);
    },
    description: 'Réponses au formulaire au format CSV',
    async resolve({ id }) {
      const answers = await prisma.answer.findMany({
        where: { question: { section: { formId: id } } },
        include: { question: true, answeredBy: true },
        orderBy: [{ answeredById: 'asc' }, { questionId: 'asc' }],
      });

      return toCsv(
        ['Personne', 'Question', 'Réponse', 'Date de réponse'] as const,
        answers.map(({ answeredBy, answer, number, question, createdAt }) => ({
          'Personne': answeredBy ? fullName(answeredBy) : '(Anonyme)',
          'Question': question.title,
          'Réponse': number?.toString() ?? answer.join(','),
          'Date de réponse': createdAt.toISOString(),
        })),
      );
    },
  }),
);
