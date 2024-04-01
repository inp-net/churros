import { log, prisma } from '#lib';
import type { sheets_v4 } from 'googleapis';
import { answerToString } from './answers.js';

export const ANSWERS_SHEET_NAME = 'Réponses';

function rowRange(questionsCount: number): string {
  return `${ANSWERS_SHEET_NAME}!A1:${String.fromCodePoint('A'.codePointAt(0)! + questionsCount)}999`;
}

export async function removeAnswersRowsForUser(
  spreadsheetId: string,
  sheets: sheets_v4.Sheets,
  userId: string,
  questionsCount: number,
) {
  try {
    // Retrieve values from the spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: rowRange(questionsCount),
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
  } catch (error) {
    console.error('Error deleting rows:', error);
  }
}

export async function appendFormAnswersToGoogleSheets(
  formId: string,
  sheets: sheets_v4.Sheets,
  userId: string,
) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      sections: {
        include: {
          questions: {
            include: {
              answers: {
                where: { createdById: userId },
              },
            },
            orderBy: [
              {
                section: { order: 'asc' },
              },
              {
                order: 'asc',
              },
            ],
          },
        },
      },
    },
  });

  const answerer = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (!form?.linkedGoogleSheetId) return;

  await log('forms', 'update-google-sheets', { userId, formId }, form.linkedGoogleSheetId);

  const questions = form.sections.flatMap((section) => section.questions);

  const latestAnswerDate = new Date(
    Math.max(...questions.flatMap(({ answers }) => answers.map((a) => a.createdAt.valueOf()))),
  );

  const row = [
    answerer.id,
    latestAnswerDate.toISOString(),
    answerer.lastName,
    answerer.firstName,
    ...questions.map(({ answers }) =>
      answers[0]
        ? answerToString({
            ...answers[0],
            question: questions.find((q) => q.id === answers[0]!.questionId)!,
          })
        : '',
    ),
  ];

  await removeAnswersRowsForUser(form.linkedGoogleSheetId, sheets, userId, questions.length);

  // @ts-expect-error googleapi is typed weirdly
  await sheets.spreadsheets.values.append({
    spreadsheetId: form.linkedGoogleSheetId,
    range: rowRange(questions.length),
    valueInputOption: 'RAW',
    resource: {
      values: [row],
    },
  });
}
