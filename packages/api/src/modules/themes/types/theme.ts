import { builder } from '#lib';
import { DateTimeScalar, VisibilityEnum } from '#modules/global';
import { canEditTheme, canSeeTheme, canSetThemeVisibility } from '#modules/themes/utils';
import { ThemeVariantType } from './theme-variant.js';

export const ThemeType = builder.prismaNode('Theme', {
  id: { field: 'id' },
  include: {
    author: true,
  },
  authScopes(theme, { user }) {
    return canSeeTheme(user, theme);
  },
  fields: (t) => ({
    name: t.exposeString('name'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    values: t.relation('values', {
      args: {
        variant: t.arg({
          type: ThemeVariantType,
          required: false,
          description: "Ne récupérer que les valeurs d'une variante du thème",
        }),
      },
      query: ({ variant }) => ({
        where: variant ? { variant } : undefined,
        orderBy: { variable: 'asc' },
      }),
    }),
    visibility: t.expose('visibility', { type: VisibilityEnum }),
    startsAt: t.expose('startsAt', { type: DateTimeScalar }),
    endsAt: t.expose('endsAt', { type: DateTimeScalar }),
    author: t.relation('author', { nullable: true }),
    canEdit: t.boolean({
      description: "Si l'utilisateur·ice connecté·e peut éditer (modifier ou supprimer) le thème",
      async resolve(theme, _, { user }) {
        return canEditTheme(user, theme);
      },
    }),
    canChangeVisibility: t.boolean({
      description:
        "Si l'utilisateur·ice connecté·e peut changer la visibilité du thème à une certaine valeur",
      args: {
        to: t.arg({ type: VisibilityEnum, required: true }),
      },
      async resolve(theme, { to }, { user }) {
        return canSetThemeVisibility(user, theme, to);
      },
    }),
  }),
});
