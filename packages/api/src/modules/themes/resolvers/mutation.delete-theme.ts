import { builder, ensureGlobalId, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { ThemeType } from '#modules/themes/types';
import { canEditTheme } from '#modules/themes/utils';

builder.mutationField('deleteTheme', (t) =>
  t.prismaField({
    type: ThemeType,
    errors: {},
    description: 'Supprimer un thème',
    args: {
      id: t.arg({ type: LocalID }),
    },
    async authScopes(_, { id }, { user }) {
      const theme = await prisma.theme.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Theme') },
        include: canEditTheme.prismaIncludes,
      });

      return canEditTheme(user, theme);
    },
    async resolve(query, _, { id }) {
      return prisma.theme.delete({
        ...query,
        where: { id: ensureGlobalId(id, 'Theme') },
      });
    },
  }),
);
