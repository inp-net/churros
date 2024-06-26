import { builder, prisma } from '#lib';
import { GroupType } from '#modules/groups';
import { PageType } from '#modules/pages/types';
import { withTrailingSlash, withoutTrailingSlash } from '../utils/paths.js';

builder.prismaObjectField(GroupType, 'page', (t) =>
  t.prismaField({
    description: 'La page associée au groupe',
    type: PageType,
    args: {
      path: t.arg.string({
        description:
          "Le chemin de la page. Ce n'est pas le chemin complet, mais celui qui est local au groupe. Voir `Page` pour plus d'informations.",
      }),
    },
    nullable: true,
    resolve: (query, { id }, { path }) =>
      prisma.page.findFirst({
        ...query,
        where: {
          groupId: id,
          path: {
            in: [withTrailingSlash(path), withoutTrailingSlash(path)],
          },
        },
      }),
  }),
);
