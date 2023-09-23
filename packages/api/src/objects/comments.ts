import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { log } from './logs.js';
import { DateTimeScalar } from './scalars.js';

export const CommentType = builder.prismaNode('Comment', {
  id: { field: 'id' },
  fields: (t) => ({
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    body: t.exposeString('body'),
    bodyHtml: t.string({
      resolve: async ({ body }) => toHtml(body),
    }),
    document: t.relation('document'),
    documentId: t.exposeID('documentId'),
    inReplyTo: t.relation('inReplyTo', { nullable: true }),
    inReplyToId: t.exposeID('inReplyToId', { nullable: true }),
    replies: t.relation('replies'),
    author: t.relation('author', { nullable: true }),
    authorId: t.exposeID('authorId', { nullable: true }),
  }),
});

builder.queryField('comments', (t) =>
  t.prismaConnection({
    type: CommentType,
    cursor: 'id',
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(query) {
      return prisma.comment.findMany({
        ...query,
        orderBy: { updatedAt: 'desc' },
      });
    },
  }),
);

builder.queryField('comment', (t) =>
  t.prismaField({
    type: CommentType,
    args: {
      id: t.arg.id(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(query, _, { id }) {
      return prisma.comment.findUniqueOrThrow({
        ...query,
        where: { id },
      });
    },
  }),
);

builder.mutationField('upsertComment', (t) =>
  t.prismaField({
    type: CommentType,
    args: {
      id: t.arg.id({ required: false }),
      body: t.arg.string(),
      documentId: t.arg.id(),
      inReplyToId: t.arg.id({ required: false }),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin || user?.canAccessDocuments);
    },
    async resolve(query, _, { id, body, documentId, inReplyToId }, { user }) {
      const upsertData = {
        body,
        document: { connect: { id: documentId } },
        inReplyTo: inReplyToId ? { connect: { id: inReplyToId } } : undefined,
      };
      await log(
        'comments',
        id ? 'edit' : inReplyToId ? 'reply' : 'comment',
        upsertData,
        id || inReplyToId || documentId,
        user,
      );
      return prisma.comment.upsert({
        ...query,
        where: { id: id ?? '' },
        create: { ...upsertData, author: { connect: { id: user!.id } } },
        update: upsertData,
      });
    },
  }),
);

builder.mutationField('deleteComment', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const comment = await prisma.comment.findUnique({ where: { id } });
      return Boolean(user?.admin || comment?.authorId === user?.id);
    },
    async resolve(_query, { id }) {
      const repliesCount = await prisma.comment.count({ where: { inReplyToId: id } });
      await log('comments', 'delete', { repliesCount }, id);
      // eslint-disable-next-line unicorn/prefer-ternary
      if (repliesCount > 0) {
        await prisma.comment.update({
          where: { id },
          data: { body: '_Commentaire supprimé_', author: { disconnect: true } },
        });
      } else {
        await prisma.comment.delete({
          where: { id },
        });
      }

      return true;
    },
  }),
);
