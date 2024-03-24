import { builder } from '#lib';
import {} from '#modules/global';
import { FormType } from '../index.js';

builder.prismaObjectField(FormType, 'linkedGoogleSheetUrl', (t) =>
  t.string({
    nullable: true,
    description:
      "L'URL du Google Sheet des réponses lié à ce formulaire. Voir `createLinkedGoogleSheet` pour créer un Google Sheet lié au formulaire.",
    resolve: async ({ linkedGoogleSheetId }) => {
      return linkedGoogleSheetId
        ? `https://docs.google.com/spreadsheets/d/${linkedGoogleSheetId}`
        : null;
    },
  }),
);
