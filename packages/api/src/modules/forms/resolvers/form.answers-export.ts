import { builder, prisma, toCsv, toTsv } from '#lib';
import {} from '#modules/global';
import { fullName } from '#modules/users';
import groupBy from 'lodash.groupby';
import uniqBy from 'lodash.uniqby';
import { answerToString } from '../index.js';
import { AnswersExportFormats, AnswersExportFormatsType } from '../types/answers-export-format.js';
import { FormType } from '../types/form.js';
import { canSeeAllAnswers } from '../utils/permissions.js';

builder.prismaObjectField(FormType, 'answersExport', (t) =>
  t.string({
    authScopes(form, {}, { user }) {
      return canSeeAllAnswers(form, form.event, user);
    },
    args: {
      format: t.arg({
        description: 'Format à utiliser',
        type: AnswersExportFormatsType,
        defaultValue: AnswersExportFormats.CSV,
      }),
    },
    description: 'Export des réponses au formulaires dans un format',
    async resolve({ id }, { format }, { user }) {
      const answers = await prisma.answer.findMany({
        where: { question: { section: { formId: id } } },
        include: { question: { include: { section: true } }, createdBy: true },
        orderBy: [{ createdById: 'asc' }, { createdAt: 'desc' }, { questionId: 'asc' }],
      });

      const questions = uniqBy(
        answers.map(({ question }) => question),
        (q) => q.id,
      ).sort((a, b) => a.section.order - b.section.order || a.order - b.order);

      const tabularHeader = [
        'Personne',
        'Profil Churros',
        'Date de réponse',
        ...questions.map((q) => q.title),
      ];

      const tabularData: Array<Record<string, string>> = [];

      const answersByUser = groupBy(answers, (a) => a.createdById);

      for (const [answererId, answers] of Object.entries(answersByUser)) {
        const answerer = answers.find((a) => a.createdById === answererId)?.createdBy;

        tabularData.push({
          'Personne': answerer ? fullName(answerer) : '(Anonyme)',
          'Profil Churros': answerer ? `https://churros.inpt.fr/@${answerer.uid}` : '',
          'Date de réponse': new Date(
            Math.max(...answers.map((a) => a.createdAt.valueOf())),
          ).toISOString(),
          ...Object.fromEntries(
            questions.map((q) => {
              const answer = answers.find((a) => a.questionId === q.id);
              return [q.title, answer ? answerToString(answer, user) : ''];
            }),
          ),
        });
      }

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
