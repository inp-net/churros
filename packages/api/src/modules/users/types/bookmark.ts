import { builder } from '#lib';

export const BookmarkType = builder.prismaNode('Bookmark', {
  id: { field: 'id' },
  description: 'Une page épinglée pour en faire un accès rapide pour un·e utilisateur·rice',
  fields: (t) => ({
    user: t.relation('user'),
    path: t.exposeString('path', { description: 'Chemin de la page' }),
  }),
});
