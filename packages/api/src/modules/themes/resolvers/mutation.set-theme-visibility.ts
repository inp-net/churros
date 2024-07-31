import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID, VisibilityEnum } from '#modules/global';
import { canSetThemeVisibility } from '#modules/themes/utils';
import { GraphQLError } from 'graphql';
import { ThemeType } from '../types/theme.js';

builder.mutationField('setThemeVisibility', (t) =>
  t.prismaField({
    type: ThemeType,
    description:
      "Changer la visibilité d'un thème. Voir `Theme.canSetVisibility` pour déterminer si l'utilisateur·ice connecté·e peut changer la visibilité d'un thème à une certaine valeur",
    args: {
      theme: t.arg({ type: LocalID, description: 'ID du thème' }),
      visibility: t.arg({ type: VisibilityEnum, description: 'Visibilité à utiliser' }),
    },
    async authScopes(_, { visibility, theme: themeId }, { user }) {
      const theme = await prisma.theme.findUnique({
        where: { id: ensureGlobalId(themeId, 'Theme') },
        include: { author: true },
      });
      if (!theme) throw new GraphQLError('Thème introuvable');
      return canSetThemeVisibility(user, theme, visibility);
    },
    async resolve(query, _, { theme, visibility }, { user }) {
      await log('themes', 'setThemeVisibility', { theme, visibility }, undefined, user);
      return prisma.theme.update({
        ...query,
        where: { id: ensureGlobalId(theme, 'Theme') },
        data: { visibility },
      });
    },
  }),
);
