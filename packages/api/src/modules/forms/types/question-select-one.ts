import { builder, prisma } from '#lib';
import { FormSectionType } from './form-section.js';
import { QuestionType } from './question.js';

export const QuestionSelectOneType = builder.prismaObject('Question', {
  variant: 'QuestionSelectOne',
  // @ts-expect-error works even though TS complains, idk why
  interfaces: [QuestionType],
  description: 'Question de type `SelectOne`',
  include: {
    jumps: true,
  },
  fields: (t) => ({
    options: t.stringList({
      description: `Uniquement pertinent pour les questions de type \`SelectOne\` ou \`SelectMultiple\``,
      resolve({ options, type }) {
        if (type !== 'SelectOne' && type !== 'SelectMultiple') return [];
        return options;
      },
    }),
    allowOptionsOther: t.exposeBoolean('allowOptionOther', {
      description:
        'Indique si la question de type `SelectOne` ou `SelectMultiple` permet une option "Autre", que l\'utilisateur·ice peut remplir sans contrainte.',
    }),
    jumps: t.prismaField({
      type: [FormSectionType],
      nullable: { items: true, list: false },
      description:
        "Correspondances entre les réponses à cette question et les sections du formulaire à sauter vers. Dans le même ordre que `options`. Quand un élément est null, la section suivante n'est pas modifiée",
      async resolve(query, { jumps, options }) {
        const jumpIds = options.map((option) => jumps.find((jump) => jump.value === option)?.id);
        const resolvedJumps = await prisma.formJump.findMany({
          include: {
            target: query,
          },
          where: { id: { in: jumpIds.filter(Boolean) as string[] } },
        });
        return jumpIds.map((id) => resolvedJumps.find((jump) => jump.id === id)?.target);
      },
    }),
  }),
});
