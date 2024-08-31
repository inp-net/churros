import { builder, prisma, subscriptionName } from '#lib';
import { CommentsConnectionType, CommentType } from '#modules/comments/types';
import { ArticleType } from '#modules/posts';

builder.prismaObjectField(ArticleType, 'comments', (t) =>
  t.prismaConnection(
    {
      cursor: 'id',
      type: CommentType,
      subscribe(subscriptions, { id }) {
        subscriptions.register(subscriptionName('Comment', 'created', id));
        subscriptions.register(subscriptionName('Comment', 'updated', id));
        subscriptions.register(subscriptionName('Comment', 'deleted', id));
      },
      async resolve(query, { id }) {
        return prisma.comment.findMany({
          ...query,
          where: {
            articleId: id,
          },
          orderBy: { createdAt: 'asc' },
        });
      },
    },
    CommentsConnectionType,
  ),
);
