import { builder } from '#lib';

export enum AnswersExportFormats {
  CSV,
  TSV,
}

export const AnswersExportFormatsType = builder.enumType(AnswersExportFormats, {
  name: 'AnswersExportFormats',
  description: "Formats d'export des réponses",
  values: {
    CSV: {
      description:
        'Format CSV (séparateur de colonnes: virgule, séparateur de lignes: saut de ligne)',
    },
    TSV: {
      description:
        'Format TSV (séparateur de colonnes: tabulation, séparateur de lignes: saut de ligne)',
    },
  },
});
