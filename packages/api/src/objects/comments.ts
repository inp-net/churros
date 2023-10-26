import { NotificationChannel, type User } from '@prisma/client';
import { TYPENAMES_TO_ID_PREFIXES, builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { notify } from '../services/notifications.js';
import { log } from './logs.js';
import { DateTimeScalar } from './scalars.js';
import { yearTier } from '../date.js';

export const CommentType = builder.prismaNode('Comment', {
  id: { field: 'id' },
  fields: (t) => ({
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    body: t.exposeString('body'),
    bodyHtml: t.string({
      resolve: async ({ body }) => toHtml(body),
    }),
    document: t.relation('document', { nullable: true }),
    documentId: t.exposeID('documentId', { nullable: true }),
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
    authScopes: () => false,
    // authScopes(_, {}, { user }) {
    //   return Boolean(user);
    // },
    async resolve(query) {
      return prisma.comment.findMany({
        ...query,
        orderBy: { createdAt: 'asc' },
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
    authScopes: () => false,
    // authScopes(_, {}, { user }) {
    //   return Boolean(user);
    // },
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
      documentId: t.arg.id({ required: false }),
      articleId: t.arg.id({ required: false }),
      inReplyToId: t.arg.id({ required: false }),
    },
    authScopes: () => false,
    // authScopes(_, { articleId, documentId }, { user }) {
    //   return false
    //   return Boolean(
    //     user?.admin ||
    //       // TODO only allow for articles the user can see
    //       articleId /* && true */ ||
    //       (documentId && user?.canAccessDocuments),
    //   );
    // },
    async resolve(query, _, { id, body, documentId, articleId, inReplyToId }, { user }) {
      const upsertData = {
        body,
        document: documentId ? { connect: { id: documentId } } : undefined,
        article: articleId ? { connect: { id: articleId } } : undefined,
        inReplyTo: inReplyToId
          ? { connect: { id: inReplyToId, documentId, articleId } }
          : undefined,
      };
      await log(
        'comments',
        id ? 'edit' : inReplyToId ? 'reply' : 'comment',
        upsertData,
        id || inReplyToId || documentId || articleId || '<nothing>',
        user,
      );
      const comment = await prisma.comment.upsert({
        ...query,
        where: { id: id ?? '' },
        create: { ...upsertData, author: { connect: { id: user!.id } } },
        update: upsertData,
        include: {
          author: true,
          inReplyTo: { include: { author: true } },
          document: {
            include: {
              subject: { include: { majors: true, minors: { include: { majors: true } } } },
              uploader: true,
            },
          },
          article: { include: { group: true, author: true } },
        },
      });

      const commentedOn: { title: string; author: User | null } | undefined = comment.document
        ? { title: comment.document.title, author: comment.document.uploader }
        : comment.article
        ? { title: comment.article.title, author: comment.article.author }
        : undefined;

      // TODO factor out code to get URL to the comment (or use /[globalId])
      const documentMajor =
        comment.document?.subject!.majors[0]?.uid ??
        comment.document?.subject!.minors[0]?.majors[0]?.uid ??
        'unknown';
      const commentUrl =
        process.env.FRONTEND_ORIGIN +
        (comment.document
          ? `/documents/${documentMajor}/${
              comment.document.subject!.minors[0]?.yearTier ??
              yearTier(comment.author?.graduationYear ?? 1)
            }a/${comment.document.subject!.uid}/${comment.document.uid}/`
          : `/posts/${comment.article!.group.uid}/${comment.article!.uid}`) +
        `#comment-${comment.id.replace(TYPENAMES_TO_ID_PREFIXES.Comment + ':', '')}`;

      if (
        !id &&
        comment.author &&
        comment.inReplyTo?.author &&
        comment.inReplyTo.author.id !== comment.author.id &&
        commentedOn
      ) {
        await notify([comment.inReplyTo.author], {
          title: `@${comment.author.uid} a répondu à votre commentaire sur ${
            commentedOn?.title ?? '???'
          }`,
          body: comment.body,
          data: {
            group: comment.article?.group.uid ?? undefined,
            channel: NotificationChannel.Comments,
            goto: commentUrl,
          },
        });
      } else if (
        !id &&
        !comment.inReplyTo &&
        commentedOn?.author &&
        commentedOn?.author !== comment.author
      ) {
        await notify([commentedOn.author], {
          title: `@${comment.author?.uid ?? '???'} a commenté sur ${commentedOn.title ?? '???'}`,
          body: comment.body,
          data: {
            group: comment.article?.group.uid ?? undefined,
            channel: NotificationChannel.Comments,
            goto: commentUrl,
          },
        });
      }

      return comment;
    },
  }),
);

builder.mutationField('deleteComment', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    authScopes: () => false,
    // async authScopes(_, { id }, { user }) {
    //   return false
    //   const comment = await prisma.comment.findUnique({ where: { id } });
    //   return Boolean(user?.admin || comment?.authorId === user?.id);
    // },
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
