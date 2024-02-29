import { builder, subscriptionName } from '#lib';
import { ArticleType } from '#modules/posts';
import { CommentsConnectionType } from '../index.js';

builder.prismaObjectField(ArticleType, 'comments', (t) =>
  t.relatedConnection(
    'comments',
    {
      cursor: 'id',
      query: {
        orderBy: { createdAt: 'asc' },
      },
      subscribe(subscriptions, { id }) {
        subscriptions.register(subscriptionName('Comment', 'created', id));
        subscriptions.register(subscriptionName('Comment', 'updated', id));
        subscriptions.register(subscriptionName('Comment', 'deleted', id));
      },
    },
    CommentsConnectionType,
  ),
);
