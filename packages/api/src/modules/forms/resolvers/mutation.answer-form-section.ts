import { builder, ensureHasIdPrefix, googleSheetsClient, prisma, publish } from '#lib';
import { GraphQLError } from 'graphql';
import uniqBy from 'lodash.uniqby';
import { AnswerInput, AnswerType } from '../types/index.js';
import {
  appendFormAnswersToGoogleSheets,
  canAnswerForm,
  canModifyFormAnswers,
  castAnswer,
  requiredIncludesForPermissions,
} from '../utils/index.js';

builder.mutationField('answerFormSection', (t) =>
  t.prismaField({
    type: [AnswerType],
    errors: {},
    args: {
      section: t.arg.id({
        description: 'ID de la section du formulaire',
      }),
      answers: t.arg({
        type: [AnswerInput],
      }),
    },
    validate: [
      [
        ({ answers }) => answers.length === uniqBy(answers, 'question').length,
        { message: 'Il y a plusieurs réponses pour la même question', path: ['answers'] },
      ],
      [
        async ({ section, answers }) => {
          const mandatoryQuestions = await prisma.question.findMany({
            where: { sectionId: section, mandatory: true },
          });
          const answeredQuestions = new Set(
            answers.filter(({ answer }) => answer.some(Boolean)).map(({ question }) => question),
          );
          return mandatoryQuestions.every((q) => answeredQuestions.has(q.id));
        },
        { message: 'Vous devez répondre à toutes les questions obligatoires', path: ['answers'] },
      ],
    ],
    async authScopes(_, { section }, { user }) {
      section = ensureHasIdPrefix(section, 'FormSection');

      const form = await prisma.formSection
        .findUniqueOrThrow({ where: { id: section } })
        .form({ include: requiredIncludesForPermissions });

      const userAnswersCount = user
        ? await prisma.answer.count({
            where: {
              createdById: user.id,
              question: { sectionId: section },
            },
          })
        : 0;

      const userContributions = user
        ? await prisma.contribution.findMany({
            where: { userId: user.id },
            include: { option: { include: { paysFor: true } } },
          })
        : [];

      if (userAnswersCount > 0)
        return canModifyFormAnswers(form, form.event, user, userContributions);

      return canAnswerForm(form, form.event, user, userContributions);
    },
    async resolve(query, _, { answers, section: sectionId }, { user }) {
      if (!user) throw new GraphQLError('Vous devez être connecté pour répondre à un formulaire');
      if (answers.length === 0) return [];
      const questions = await prisma.question.findMany({
        where: { sectionId, id: { in: answers.map((a) => a.question) } },
      });
      const questionById = (id: string) => questions.find((q) => q.id === id)!;
      const results = await prisma.$transaction(
        answers.map(({ question: questionId, answer }) =>
          prisma.answer.upsert({
            ...query,
            where: {
              questionId_createdById: {
                questionId,
                createdById: user.id,
              },
              question: { sectionId },
            },
            create: {
              questionId,
              createdById: user.id,
              ...castAnswer(answer, user.id, questionById(questionId), user),
            },
            update: {
              ...castAnswer(answer, user.id, questionById(questionId), user),
            },
          }),
        ),
      );

      const form = await prisma.formSection.findUniqueOrThrow({ where: { id: sectionId } }).form();

      if (form.createdById) {
        try {
          const sheets = await googleSheetsClient(form.createdById);
          await appendFormAnswersToGoogleSheets(form.id, sheets, user.id);
        } catch (error) {
          console.error(error);
        }
      }

      publish(form.id, 'updated', answers);

      // Make sure results are sorted the same way as the input
      return answers.map(
        ({ question }) => results.find((result) => result.questionId === question)!,
      );
    },
  }),
);
