import { builder, prisma, toHtml } from '#lib';
import { DateTimeScalar, HTMLScalar } from '#modules/global';
import { ReactableInterface } from '#modules/reactions';
import { GraphQLError } from 'graphql';
import { canEditComment } from '../utils/permissions.js';

export const CommentType = builder.prismaNode('Comment', {
  id: { field: 'id' },
  include: { reactions: true },
  interfaces: [ReactableInterface],
  authScopes: { loggedIn: true },
  fields: (t) => ({
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    edited: t.boolean({
      resolve: ({ createdAt, updatedAt }) => createdAt !== updatedAt,
    }),
    resourceId: t.id({
      resolve({ articleId, documentId }) {
        if (articleId) return articleId;
        if (documentId) return documentId;
        throw new GraphQLError('Comment has no resource');
      },
    }),
    body: t.exposeString('body'),
    bodyHtml: t.field({
      type: HTMLScalar,
      resolve: async ({ body }) => toHtml(body),
    }),
    inReplyTo: t.relation('inReplyTo', { nullable: true }),
    inReplyToId: t.exposeID('inReplyToId', { nullable: true }),
    author: t.relation('author', { nullable: true }),
    authorId: t.exposeID('authorId', { nullable: true }),
    canReply: t.boolean({
      resolve: (_, __, { user }) => Boolean(user),
    }),
    canEdit: t.boolean({
      async resolve({ id }, _, { user }) {
        const comment = await prisma.comment.findUniqueOrThrow({
          where: { id },
          include: canEditComment.prismaIncludes,
        });
        return canEditComment(user, comment);
      },
    }),
  }),
});
