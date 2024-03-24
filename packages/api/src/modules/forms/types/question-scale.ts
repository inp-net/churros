import { builder } from '#lib';
import { QuestionType } from './question.js';

export const QuestionScaleType = builder.prismaObject('Question', {
  variant: 'QuestionScale',
  // @ts-expect-error works even though TS complains, idk why
  interfaces: [QuestionType],
  description: 'Question de type `Scale`',
  fields: (t) => ({
    minimum: t.int({
      description: 'Valeur minimale',
      resolve({ scaleStart }) {
        return scaleStart!;
      },
    }),
    minimumLabel: t.string({
      description: 'Label de la valeur minimale',
      resolve({ options }) {
        return options[0] ?? '';
      },
    }),
    maximum: t.int({
      description: 'Valeur maximale',
      resolve({ scaleEnd }) {
        return scaleEnd!;
      },
    }),
    maximumLabel: t.string({
      description: 'Label de la valeur maximale',
      resolve({ options }) {
        return options.at(-1) ?? '';
      },
    }),
    options: t.intList({
      description: 'Liste des valeurs possibles',
      resolve({ scaleStart, scaleEnd }) {
        return Array.from({ length: scaleEnd! - scaleStart! + 1 }, (_, i) => i + scaleStart!);
      },
    }),
    labels: t.stringList({
      description: 'Liste des labels pour les valeurs possibles',
      resolve({ scaleStart, scaleEnd, options }) {
        return Array.from({ length: scaleEnd! - scaleStart! + 1 }, (_, i) => {
          if (i === 0) return options[0] ?? '';
          if (i === scaleEnd! - scaleStart!) return options.at(-1) ?? '';
          return '';
        });
      },
    }),
  }),
});
