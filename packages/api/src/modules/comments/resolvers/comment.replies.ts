import { builder, prisma } from '#lib';
import { CommentType } from '#modules/comments/types';

builder.prismaObjectField(CommentType, 'replies', (t) =>
  t.prismaConnection({
    type: CommentType,
    cursor: 'id',
    description: 'Réponses à ce commentaire',
    args: {
      flat: t.arg.boolean({
        description:
          'Inclure les commentaires qui sont en réponses à des réponses de ce commentaire, récursivement. Pour le nombre total sur la connection, renverra le nombre de réponses du commentaire racine.',
      }),
    },
    async totalCount({ id }, { flat }) {
      return prisma.comment.count({
        where: flat ? { threadRootId: id } : { inReplyToId: id },
      });
    },
    async resolve(query, comment, { flat }) {
      if (flat)
        return prisma.comment
          .findUniqueOrThrow({
            where: { id: comment.id },
          })
          .thread({
            ...query,
          });
      else
        return prisma.comment
          .findUniqueOrThrow({
            where: { id: comment.id },
          })
          .replies({
            ...query,
          });
    },
  }),
);
