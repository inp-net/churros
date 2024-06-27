import { builder, prisma } from '#lib';
import { PageType } from '#modules/pages/types';
import { StudentAssociationType } from '#modules/student-associations';
import { withTrailingSlash, withoutTrailingSlash } from '../utils/paths.js';

builder.prismaObjectField(StudentAssociationType, 'page', (t) =>
  t.prismaField({
    description: "La page associée à l'AE",
    type: PageType,
    args: {
      path: t.arg.string({
        description:
          "Le chemin de la page. Ce n'est pas le chemin complet, mais celui qui est local à l'AE. Voir `Page` pour plus d'informations.",
      }),
    },
    nullable: true,
    resolve: (query, { id }, { path }) =>
      prisma.page.findFirst({
        ...query,
        where: {
          studentAssociationId: id,
          path: {
            in: [withTrailingSlash(path), withoutTrailingSlash(path)],
          },
        },
      }),
  }),
);
