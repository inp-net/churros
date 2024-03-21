import { log, prisma } from '#lib';
import type { Answer, User } from '@prisma/client';
import type { sheets_v4 } from 'googleapis';
import groupBy from 'lodash.groupby';
import { answerToString } from './answers.js';

export const ANSWERS_SHEET_NAME = 'Réponses';

export async function removeAnswersRowsForUser(
  spreadsheetId: string,
  sheets: sheets_v4.Sheets,
  userId: string,
) {
  try {
    // Retrieve values from the spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${ANSWERS_SHEET_NAME}!A1:Z`,
    });

    const rows = response.data.values as string[][];

    // Identify rows to delete based on the value in the userID
    const rowsToDelete = rows.filter((row) => row[0]?.trim().toLowerCase() === userId);

    if (rowsToDelete.length === 0) return;

    // get sheet id from the sheet name
    const sheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetId = sheet.data.sheets?.find((s) => s.properties?.title === ANSWERS_SHEET_NAME)
      ?.properties?.sheetId;

    // Create a request to delete rows
    const deleteRequest = {
      spreadsheetId,
      resource: {
        requests: rowsToDelete.map((row) => ({
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rows.indexOf(row),
              endIndex: rows.indexOf(row) + 1,
            },
          },
        })),
      },
    };

    // Execute the request to delete rows
    await sheets.spreadsheets.batchUpdate(deleteRequest);
  } catch (err) {
    console.error('Error deleting rows:', err);
  }
}

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
                include: { createdBy: true },
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
  const answersSheets: Record<string, Array<Answer & { createdBy: null | User }>> = groupBy(
    form.sections.flatMap((section) => section.questions.flatMap((question) => question.answers)),
    (answer) => answer.createdById ?? '',
  );
  // for each user, only keep the last answer for each question
  for (const [userId, answers] of Object.entries(answersSheets)) {
    answersSheets[userId] = Object.values(groupBy(answers, (answer) => answer.questionId)).map(
      (answers) => answers.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf()).at(-1)!,
    );
  }

  const questions = form.sections.flatMap((section) => section.questions);

  // generate rows, one per user, sorted by last answer date
  const rows = Object.entries(answersSheets)
    .sort(([a], [b]) => (a > b ? -1 : 1))
    .map(([answeredById, answers]) => {
      const user = answers[0]!.createdBy;
      return [
        answeredById,
        new Date(Math.max(...answers.map((answer) => answer.createdAt.valueOf()))).toISOString(),
        user?.lastName,
        user?.firstName,
        ...answers.map(({ answer, number, questionId }) =>
          answerToString({
            answer,
            number,
            question: questions.find((q) => q.id === questionId)!,
          }),
        ),
      ];
    });

  if (rows[0]?.[0]) await removeAnswersRowsForUser(form.linkedGoogleSheetId, sheets, rows[0][0]);

  // @ts-expect-error googleapi is typed weirdly
  await sheets.spreadsheets.values.append({
    spreadsheetId: form.linkedGoogleSheetId,
    range: `${ANSWERS_SHEET_NAME}!A1:Z`,
    valueInputOption: 'RAW',
    resource: {
      values: rows,
    },
  });
}
