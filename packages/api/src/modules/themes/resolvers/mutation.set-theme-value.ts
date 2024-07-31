import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { ThemeType, ThemeVariableType, ThemeVariantType } from '#modules/themes/types';
import { canEditTheme } from '#modules/themes/utils';
import { GraphQLError } from 'graphql';

builder.mutationField('setThemeValue', (t) =>
  t.prismaField({
    type: ThemeType,
    description: "Changer la valeur d'une variable d'un thème",
    args: {
      theme: t.arg({ type: LocalID, description: 'ID du thème' }),
      variant: t.arg({ type: ThemeVariantType, description: 'Variante du thème' }),
      variable: t.arg({ type: ThemeVariableType }),
      value: t.arg.string({
        required: true,
        description: 'Valeur à utiliser. Doit être une valeur CSS valide',
      }),
    },
    async authScopes(_, { theme: themeId }, { user }) {
      const theme = await prisma.theme.findUnique({
        where: { id: themeId },
        include: { author: true },
      });
      if (!theme) throw new GraphQLError('Thème introuvable');
      return canEditTheme(user, theme);
    },
    async resolve(query, _, { theme: themeId, variant, variable, value }, { user }) {
      const id = ensureGlobalId(themeId, 'Theme');
      await log('themes', 'setThemeValue', { themeId, variant, variable, value }, themeId, user);
      const [__, theme] = await prisma.$transaction([
        prisma.themeValue.upsert({
          where: {
            themeId_variant_variable: {
              themeId: id,
              variant,
              variable,
            },
          },
          create: {
            theme: { connect: { id } },
            variant,
            variable,
            value,
          },
          update: {
            value,
          },
        }),
        prisma.theme.findUniqueOrThrow({ ...query, where: { id } }),
      ]);
      return theme;
    },
  }),
);
