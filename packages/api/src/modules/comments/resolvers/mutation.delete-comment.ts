import { builder, log, objectValuesFlat, prisma, publish } from '#lib';
import { CommentType } from '#modules/comments/types';
import { userIsAdminOf } from '#permissions';

builder.mutationField('deleteComment', (t) =>
  t.prismaField({
    type: CommentType,
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
    async resolve(query, _, { id }) {
      const repliesCount = await prisma.comment.count({ where: { inReplyToId: id } });
      await log('comments', 'delete', { repliesCount }, id);

      const comment = await (repliesCount > 0
        ? prisma.comment.update({
            ...query,
            where: { id },
            data: { body: '_Commentaire supprimé_', author: { disconnect: true } },
          })
        : prisma.comment.delete({
            ...query,
            where: { id },
          }));

      publish(id, 'deleted', id, comment.articleId ?? comment.documentId ?? undefined);

      return comment;
    },
  }),
);
