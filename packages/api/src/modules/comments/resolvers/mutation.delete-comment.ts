import { builder, log, objectValuesFlat, prisma, publish } from '#lib';
import { userIsAdminOf } from '#permissions';

builder.mutationField('deleteComment', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const comment = await prisma.comment.findUnique({
        where: { id },
        include: {
          article: { select: { group: { select: { studentAssociationId: true } } } },
          document: {
            select: {
              subject: {
                select: {
                  minors: {
                    select: {
                      majors: {
                        select: {
                          schools: { select: { studentAssociations: { select: { id: true } } } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return Boolean(
        userIsAdminOf(user, objectValuesFlat(comment?.document || comment?.article)) ||
          comment?.authorId === user?.id,
      );
    },
    async resolve(_query, { id }) {
      const repliesCount = await prisma.comment.count({ where: { inReplyToId: id } });
      await log('comments', 'delete', { repliesCount }, id);

      let articleId: string | null | undefined;
      let documentId: string | null | undefined;

      if (repliesCount > 0) {
        ({ articleId, documentId } = await prisma.comment.update({
          where: { id },
          data: { body: '_Commentaire supprimé_', author: { disconnect: true } },
        }));
      } else {
        ({ articleId, documentId } = await prisma.comment.delete({
          where: { id },
        }));
      }

      publish(id, 'deleted', id, articleId ?? documentId ?? undefined);

      return true;
    },
  }),
);
