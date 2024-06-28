import { builder } from '#lib';
import { QuestionKind } from '@churros/db/prisma';

export const QuestionKindType = builder.enumType(QuestionKind, {
  description: 'Le type de question',
  name: 'QuestionKind',
  values: {
    Date: { description: 'La réponse est une date, sans heure associée.' },
    FileUpload: { description: "La réponse est un fichier mis en ligne par l'utilisateur·ice." },
    LongText: { description: 'La réponse est un texte long.' },
    Number: { description: 'La réponse est un nombre, potentiellement à virgule.' },
    Scale: { description: 'La réponse est un nombre entier entre deux bornes' },
    SelectMultiple: { description: 'La réponse est une ou plusieurs options parmi une liste.' },
    SelectOne: { description: 'La réponse est une des options parmi une liste.' },
    Text: { description: 'La réponse est un texte court.' },
    Time: {
      description: 'La réponse est un temps  (heures, minute et seconde), sans date associée.',
    },
  },
});
