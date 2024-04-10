import { builder } from '#lib';
import { QuestionType } from './question.js';

export const QuestionSelectMultipleType = builder.prismaObject('Question', {
  variant: 'QuestionSelectMultiple',
  // @ts-expect-error works even though TS complains, idk why
  interfaces: [QuestionType],
  description: 'Question de type `SelectMultiple`',
  fields: (t) => ({
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
        return type === 'SelectOne' || type === 'SelectMultiple'
          ? options.includes('Autre')
          : false;
      },
    }),
  }),
});
