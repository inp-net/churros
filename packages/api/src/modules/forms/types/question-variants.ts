import { builder } from '#lib';
import { QuestionType } from './question.js';

export const QuestionScaleType = builder.prismaObject('Question', {
  variant: 'QuestionScale',
  interfaces: [QuestionType],
  isTypeOf: ({ type }) => type === 'Scale',
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
          if (i === 0) return options[0];
          if (i === scaleEnd! - scaleStart!) return options.at(-1);
          return '';
        });
      },
    }),
  }),
});

const fieldsForSelectTypes = (t) => ({
  options: t.stringList({
    description: `Uniquement pertinent pour les questions de type \`SelectOne\` ou \`SelectMultiple\``,
    resolve({ options, type }) {
      if (type !== 'SelectOne' && type !== 'SelectMultiple') return [];
      return options;
    },
  }),
  allowOptionsOther: t.boolean({
    description:
      'Indique si la question de type `SelectOne` ou `SelectMultiple` permet une option "Autre", que l\'utilisateur·ice peut remplir sans contrainte.',
    resolve({ type, options }) {
      return type === 'SelectOne' || type === 'SelectMultiple' ? options.includes('Autre') : false;
    },
  }),
});

export const QuestionSelectOneType = builder.prismaObject('Question', {
  variant: 'QuestionSelectOne',
  interfaces: [QuestionType],
  isTypeOf: ({ type }) => type === 'SelectOne',
  description: 'Question de type `SelectOne`',
  fields: (t) => ({
    ...fieldsForSelectTypes(t),
    jumpTo: t.id({
      nullable: true,
      description:
        "Section à aller selon la réponse à cette question. Uniquement pertinent pour les questions de type `SelectOne`. Si null, la réponse n'a pas d'effet sur la section suivante.",
      args: {
        answer: t.arg.string({
          description: 'Réponse à la question',
        }),
      },
      resolve({ goToSection, type, options }, { answer }) {
        if (type !== 'SelectOne') return null;
        return goToSection[options.indexOf(answer)];
      },
    }),
  }),
});

export const QuestionSelectMultipleType = builder.prismaObject('Question', {
  variant: 'QuestionSelectMultiple',
  interfaces: [QuestionType],
  isTypeOf: ({ type }) => type === 'SelectMultiple',
  description: 'Question de type `SelectMultiple`',
  fields: fieldsForSelectTypes,
});

export const QuestionFileUploadType = builder.prismaObject('Question', {
  variant: 'QuestionFileUpload',
  interfaces: [QuestionType],
  isTypeOf: ({ type }) => type === 'FileUpload',
  description: 'Question de type `FileUpload`',
  fields: (t) => ({
    allowedFileTypes: t.stringList({
      nullable: true,
      description:
        "Types de fichiers autorisés pour les questions de type `File`. Null si la question n'est pas de type `File`.",
      resolve({ type, allowedFiletypes }) {
        return type === 'FileUpload' ? allowedFiletypes : null;
      },
    }),
  }),
});

export const QuestionScalarType = builder.prismaObject('Question', {
  variant: 'QuestionScalar',
  interfaces: [QuestionType],
  isTypeOf: ({ type }) => ['Text', 'Number', 'Date', 'Time', 'LongText'].includes(type),
  description: 'Question de type `Text`, `Number`, `Date`, `Time` ou `LongText`',
});
