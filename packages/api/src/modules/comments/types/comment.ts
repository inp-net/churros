import { builder, prisma, toHtml } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { ReactableInterface } from '#modules/reactions';
import { canEditComment } from '../utils/permissions.js';

export const CommentType = builder.prismaNode('Comment', {
  id: { field: 'id' },
  include: { reactions: true },
  interfaces: [ReactableInterface],
  fields: (t) => ({
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    edited: t.boolean({
      resolve: ({ createdAt, updatedAt }) => createdAt !== updatedAt,
    }),
    body: t.exposeString('body'),
    bodyHtml: t.string({
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
