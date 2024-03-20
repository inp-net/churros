import { log, prisma } from '#lib';
import type { Answer, User } from '@prisma/client';
import type { sheets_v4 } from 'googleapis';
import groupBy from 'lodash.groupby';

export async function appendFormAnswersToGoogleSheets(
  formId: string,
  sheets: sheets_v4.Sheets,
  answerIds: string[],
) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      sections: {
        include: {
          questions: {
            include: {
              answers: {
                where: { id: { in: answerIds } },
                include: { answeredBy: true },
              },
            },
          },
        },
      },
    },
  });

  if (!form?.linkedGoogleSheetId) return;

  await log('forms', 'update-google-sheets', { answerIds }, form.linkedGoogleSheetId);


  // group all answers by user
  const answersSheets: Record<string, Array<Answer & { answeredBy: null | User }>> = groupBy(
    form.sections.flatMap((section) => section.questions.flatMap((question) => question.answers)),
    (answer) => answer.answeredById ?? '',
  );
  // for each user, only keep the last answer for each question
  for (const [userId, answers] of Object.entries(answersSheets)) {
    answersSheets[userId] = Object.values(groupBy(answers, (answer) => answer.questionId)).map(
      (answers) => answers.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf()).at(-1)!,
    );
  }

  const answerValue = (answer: Answer) => answer.number?.toString() ?? answer.answer.join(', ');

  // generate rows, one per user, sorted by last answer date
  const rows = Object.entries(answersSheets)
    .sort(([a], [b]) => (a > b ? -1 : 1))
    .map(([answeredById, answers]) => {
      const user = answers[0]!.answeredBy;
      return [
        answeredById,
        new Date(Math.max(...answers.map((answer) => answer.createdAt.valueOf()))).toISOString(),
        user?.lastName,
        user?.firstName,
        ...answers.map((a) => answerValue(a)),
      ];
    });

  // @ts-expect-error googleapi is typed weirdly
  await sheets.spreadsheets.values.append({
    spreadsheetId: form.linkedGoogleSheetId,
    range: 'A1',
    valueInputOption: 'RAW',
    resource: {
      values: rows,
    },
  });
}
