import { builder, prisma, toCsv, toTsv } from '#lib';
import {} from '#modules/global';
import { fullName } from '#modules/users';
import {} from '../index.js';
import { AnswersExportFormats, AnswersExportFormatsType } from '../types/answers-export-format.js';
import { FormType } from '../types/form.js';
import { canSeeAllAnswers } from '../utils/permissions.js';

builder.prismaObjectField(FormType, 'answersExport', (t) =>
  t.string({
    authScopes({ event, createdById }, {}, { user }) {
      return canSeeAllAnswers({ createdById }, event, user);
    },
    args: {
      format: t.arg({
        description: 'Format à utiliser',
        type: AnswersExportFormatsType,
        defaultValue: AnswersExportFormats.CSV,
      }),
    },
    description: 'Export des réponses au formulaires dans un format',
    async resolve({ id }, { format }) {
      const answers = await prisma.answer.findMany({
        where: { question: { section: { formId: id } } },
        include: { question: true, answeredBy: true },
        orderBy: [{ answeredById: 'asc' }, { questionId: 'asc' }],
      });

      const tabularHeader = ['Personne', 'Question', 'Réponse', 'Date de réponse'] as const;
      const tabularData = answers.map(({ answeredBy, answer, number, question, createdAt }) => ({
        'Personne': answeredBy ? fullName(answeredBy) : '(Anonyme)',
        'Question': question.title,
        'Réponse': number?.toString() ?? answer.join(','),
        'Date de réponse': createdAt.toISOString(),
      }));
      switch (format) {
        case AnswersExportFormats.CSV: {
          return toCsv(tabularHeader, tabularData);
        }

        case AnswersExportFormats.TSV: {
          return toTsv(tabularHeader, tabularData);
        }
      }
    },
  }),
);
