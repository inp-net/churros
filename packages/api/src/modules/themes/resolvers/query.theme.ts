import { builder, ensureGlobalId, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { ThemeType } from '#modules/themes/types';

builder.queryField('theme', (t) =>
  t.prismaField({
    type: ThemeType,
    nullable: true,
    description: 'Récupérer un thème par son ID',
    args: {
      id: t.arg({
        type: LocalID,
      }),
    },
    authScopes: () => true,
    async resolve(query, _, { id }) {
      return prisma.theme.findUnique({
        ...query,
        where: { id: ensureGlobalId(id, 'Theme') },
      });
    },
  }),
);
