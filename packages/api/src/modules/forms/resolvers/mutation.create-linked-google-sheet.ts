import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import { googleSheetsClient } from '../../../lib/google.js';
import { ANSWERS_SHEET_NAME, appendFormAnswersToGoogleSheets } from '../utils/google-sheets.js';

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
      const form = await prisma.form.findUniqueOrThrow({
        where: { id: formId },
        include: {
          sections: {
            include: { questions: { include: { answers: true } } },
          },
        },
      });
      const sheets = await googleSheetsClient(user.id);

      let spreadsheetId = form.linkedGoogleSheetId;

      if (spreadsheetId) {
        // check if the spreadsheet exists
        try {
          await sheets.spreadsheets.get({ spreadsheetId });
        } catch {
          spreadsheetId = null;
          await prisma.form.update({
            where: { id: formId },
            data: { linkedGoogleSheetId: null },
          });
        }
      }

      if (!spreadsheetId) {
        spreadsheetId = await sheets.spreadsheets
          .create({
            // @ts-expect-error googleapi is typed weirdly
            resource: {
              properties: {
                title: `Réponses au formulaire ${form.title}`,
              },
              sheets: [
                {
                  properties: {
                    title: ANSWERS_SHEET_NAME,
                  },
                },
              ],
            },
          })
          // @ts-expect-error googleapi is typed weirdly
          .then((response) => response.data.spreadsheetId);

        await prisma.form.update({
          where: { id: formId },
          data: { linkedGoogleSheetId: spreadsheetId },
        });

        if (!spreadsheetId) throw new GraphQLError('No spreadsheet');

        //TODO more data (linked event booking, etc)
        const header = [
          'Identifiant (NE PAS MODIFIER)',
          'Date de réponse',
          'Nom',
          'Prénom',
          ...form.sections.flatMap((section) =>
            section.questions.map((question) =>
              section.title.length > 0 ? `${section.title} > ${question.title}` : question.title,
            ),
          ),
        ];

        const rowRange = (rowNumber: number) =>
          `${ANSWERS_SHEET_NAME}!A${rowNumber}:${String.fromCodePoint(65 + header.length - 1)}${rowNumber}`;

        // @ts-expect-error googleapi is typed weirdly
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: rowRange(1),
          valueInputOption: 'RAW',
          resource: {
            values: [header],
          },
        });

        type Answer = (typeof form)['sections'][number]['questions'][number]['answers'][number];

        await Promise.all(
          form.sections.flatMap((section) =>
            section.questions.flatMap((question) =>
              question.answers
                .filter(
                  (answer: Answer): answer is Answer & { createdById: string } =>
                    answer.createdById !== null,
                )
                .map((answer) =>
                  appendFormAnswersToGoogleSheets(form.id, sheets, answer.createdById),
                ),
            ),
          ),
        );
      }

      return (await sheets.spreadsheets
        .get({ spreadsheetId })
        .then((response) => response.data.spreadsheetUrl)) as string;
    },
  }),
);
