import { builder, prisma } from '#lib';
import { canListTheme, ThemeType } from '../index.js';

builder.queryField('themes', (t) =>
  t.prismaField({
    type: [ThemeType],
    args: {
      all: t.arg.boolean({
        description: 'Récupérer tous les thèmes auquel ont a accès, même ceux qui sont passés',
        required: false,
      }),
    },
    async resolve(query, _, { all }, { user }) {
      const themes = await prisma.theme.findMany({
        ...query,
        include: {
          ...query.include,
          author: query.include?.author || true,
        },
      });
      return themes.filter((theme) => canListTheme(user, theme, all ? 'can' : 'want'));
    },
  }),
);
