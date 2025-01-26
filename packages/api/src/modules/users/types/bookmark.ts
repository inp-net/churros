import { builder, ENV, isGlobalIdOf, prisma } from '#lib';
import { URLScalar } from '#modules/global';

export const BookmarkType = builder.prismaNode('Bookmark', {
  id: { field: 'id' },
  description: 'Une page épinglée pour en faire un accès rapide pour un·e utilisateur·rice',
  fields: (t) => ({
    user: t.relation('user'),
    path: t.exposeString('path', {
      description:
        'Chemin de la page, ou identifiant global pour les services épinglés. Voir aussi Bookmark.url',
    }),
    url: t.field({
      type: URLScalar,
      description:
        "URL vers la page. Pratique notamment pour les services épinglés, qui n'ont pas de valeur utile pour Bookmark.path.",
      async resolve({ path }) {
        if (isGlobalIdOf('Service', path)) {
          const url = await prisma.service
            .findUnique({ where: { id: path }, select: { url: true } })
            .then((service) => service?.url);

          if (url && URL.canParse(url)) return new URL(url);
        }

        return new URL(path, ENV.PUBLIC_FRONTEND_ORIGIN);
      },
    }),
  }),
});
