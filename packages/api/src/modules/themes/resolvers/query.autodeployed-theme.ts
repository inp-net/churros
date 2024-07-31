import { builder, prisma } from '#lib';
import { ThemeType } from '../types/theme.js';
import { canSeeTheme } from '../utils/permissions.js';

builder.queryField('autodeployedTheme', (t) =>
  t.prismaField({
    type: ThemeType,
    nullable: true,
    description:
      "Récupérer le thème qui est actuellement choisi pour un déploiement automatique: le thème de l'utilisateur·ice doit être changé à celui-ci, si iel n'a pas explicitement demandé à ne pas utiliser ce thème",
    async resolve(query, _, __, { user }) {
      const activeAndAutodeployedThemes = await prisma.theme.findMany({
        ...query,
        where: {
          autodeploy: true,
          startsAt: { lte: new Date() },
          endsAt: { gte: new Date() },
          blockedBy: {
            none: {
              id: user?.id,
            },
          },
        },
        include: {
          ...query.include,
          author: query.include?.author || true,
        },
      });

      return activeAndAutodeployedThemes.find((theme) => canSeeTheme(user, theme));
    },
  }),
);
