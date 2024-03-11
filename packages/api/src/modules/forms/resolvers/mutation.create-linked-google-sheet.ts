import { builder, prisma } from '#lib';
import type { Answer, User } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { GraphQLError } from 'graphql';
import groupBy from 'lodash.groupby';

builder.mutationField('createLinkedGoogleSheet', (t) =>
  t.string({
    description:
      "Crée une feuille Google Sheets (si elle n'existe pas déjà) qui contiendra les réponses au formulaire (et sera mise à jour automatiquement). Renvoie l'URL de la feuille Google Sheets.",
    args: {
      form: t.arg.id({ description: "L'identifiant du formulaire" }),
    },
    authScopes: { loggedIn: true },
    resolve: async (_, { form: formId }, { user }) => {
      if (!user) throw new GraphQLError('User not found');
      let { linkedGoogleSheetId: spreadsheetId, ...form } = await prisma.form.findUniqueOrThrow({
        where: { id: formId },
        include: {
          sections: {
            include: { questions: { include: { answers: { include: { answeredBy: true } } } } },
          },
        },
      });

      const googleCredential = await prisma.credential.findFirst({
        where: { userId: user.id, type: 'Google' },
      });

      if (!googleCredential)
        throw new GraphQLError('Veuillez lier votre compte Google à Churros avant de continuer');

      const authClient = new OAuth2Client();
      authClient.setCredentials({
        access_token: googleCredential.value,
        expiry_date: googleCredential.expiresAt?.valueOf(),
        refresh_token: googleCredential.refresh,
      });

      const sheets = google.sheets({
        version: 'v4',
        auth: authClient,
      });

      // let sheet: sheets_v4.Schema$Spreadsheet;
      if (!spreadsheetId) {
        spreadsheetId = await sheets.spreadsheets
          .create({
            resource: {
              properties: {
                title: `Réponses au formulaire ${form.title}`,
              },
            },
          })
          .then((response) => response.data.spreadsheetId);

        await prisma.form.update({
          where: { id: formId },
          data: { linkedGoogleSheetId: spreadsheetId },
        });

        if (!spreadsheetId) throw new GraphQLError('No spreadsheet');

        const header = [
          'Identifiant (NE PAS MODIFIER)',
          'Date de réponse',
          'Nom',
          'Prénom',
          ...form.sections.flatMap((section) =>
            section.questions.map((question) => question.title),
          ),
        ];

        const rowRange = (rowNumber: number) =>
          `A${rowNumber}:${String.fromCodePoint(65 + header.length - 1)}${rowNumber}`;

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: rowRange(1),
          valueInputOption: 'RAW',
          resource: {
            values: [header],
          },
        });

        // group all answers by user
        const answersSheets: Record<string, Array<Answer & { answeredBy: null | User }>> = groupBy(
          form.sections.flatMap((section) =>
            section.questions.flatMap((question) => question.answers),
          ),
          (answer) => answer.answeredById ?? '',
        );
        // for each user, only keep the last answer for each question
        for (const [userId, answers] of Object.entries(answersSheets)) {
          answersSheets[userId] = Object.values(
            groupBy(answers, (answer) => answer.questionId),
          ).map((answers) =>
            answers.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf()).at(-1),
          )!;
        }

        const answerValue = (answer: Answer) =>
          answer.number?.toString() ?? answer.answer.join(', ');

        // generate rows, one per user, sorted by last answer date
        const rows = Object.entries(answersSheets)
          .sort(([a], [b]) => (a > b ? -1 : 1))
          .map(([answeredById, answers]) => {
            const user = answers[0]!.answeredBy;
            return [
              answeredById,
              new Date(
                Math.max(...answers.map((answer) => answer.createdAt.valueOf())),
              ).toISOString(),
              user?.lastName,
              user?.firstName,
              ...answers.map((a) => answerValue(a)),
            ];
          });

        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'A1',
          valueInputOption: 'RAW',
          resource: {
            values: rows,
          },
        });
      }

      return await sheets.spreadsheets
        .get({ spreadsheetId })
        .then((response) => response.data.spreadsheetUrl);
    },
  }),
);
