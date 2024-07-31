import { builder, ensureGlobalId, prisma, UnauthorizedError } from '#lib';
import { LocalID } from '#modules/global';
import { ThemeType } from '#modules/themes/types';

builder.mutationField('blockTheme', (t) =>
  t.prismaField({
    type: ThemeType,
    description:
      "Bloquer un thème pour empêcher qu'il soit automatiquement déployé à l'utilisateur·ice connecté·e",
    args: {
      id: t.arg({
        type: LocalID,
        description: 'ID du thème',
      }),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { id: themeId }, { user }) {
      if (!user) throw new UnauthorizedError();
      return prisma.theme.update({
        ...query,
        where: { id: ensureGlobalId(themeId, 'Theme') },
        data: {
          blockedBy: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    },
  }),
);
