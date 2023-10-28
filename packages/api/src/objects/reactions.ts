import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { log } from './logs.js';
import { DateTimeScalar } from './scalars.js';

export const ReactionType = builder.prismaNode('Reaction', {
  id: { field: 'id' },
  fields: (t) => ({
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    emoji: t.exposeString('emoji'),
    document: t.relation('document', { nullable: true }),
    documentId: t.exposeID('documentId', { nullable: true }),
    comment: t.relation('comment', { nullable: true }),
    commentId: t.exposeID('commentId', { nullable: true }),
    author: t.relation('author', { nullable: true }),
    authorId: t.exposeID('authorId', { nullable: true }),
  }),
});

builder.queryField('reactions', (t) =>
  t.prismaConnection({
    type: ReactionType,
    cursor: 'id',
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(query) {
      return prisma.reaction.findMany({
        ...query,
        orderBy: { createdAt: 'asc' },
      });
    },
  }),
);

builder.queryField('reaction', (t) =>
  t.prismaField({
    type: ReactionType,
    args: {
      id: t.arg.id(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(query, _, { id }) {
      return prisma.reaction.findUniqueOrThrow({
        ...query,
        where: { id },
      });
    },
  }),
);

builder.mutationField('upsertReaction', (t) =>
  t.int({
    args: {
      id: t.arg.id({ required: false }),
      emoji: t.arg.string({ validate: { maxLength: 2 } }),
      documentId: t.arg.id({ required: false }),
      articleId: t.arg.id({ required: false }),
      commentId: t.arg.id({ required: false }),
      eventId: t.arg.id({ required: false }),
    },
    authScopes(_, { articleId, documentId, eventId }, { user }) {
      if (!user) return false;
      return Boolean(
        user?.admin ||
          // TODO only allow for articles the user can see
          articleId /* && true */ ||
          // TODO only allow for events the user can see
          eventId /* && true */ ||
          (documentId && user?.canAccessDocuments),
      );
    },
    async resolve(query, { id, emoji, documentId, articleId, commentId, eventId }, { user }) {
      const upsertData = {
        emoji,
        document: documentId ? { connect: { id: documentId } } : undefined,
        article: articleId ? { connect: { id: articleId } } : undefined,
        comment: commentId ? { connect: { id: commentId } } : undefined,
        event: eventId ? { connect: { id: eventId } } : undefined,
      };

      await log(
        'reactions',
        id ? 'edit-reaction' : 'react',
        upsertData,
        id || commentId || documentId || articleId || '<nothing>',
        user,
      );

      await prisma.reaction.upsert({
        ...query,
        where: { id: id ?? '' },
        create: { ...upsertData, author: { connect: { id: user!.id } } },
        update: upsertData,
        include: {
          author: true,
          comment: { include: { author: true } },
          document: {
            include: {
              subject: { include: { majors: true, minors: { include: { majors: true } } } },
            },
          },
          article: { include: { group: true } },
        },
      });

      return prisma.reaction.count({
        where: { emoji, documentId, articleId, commentId, eventId },
      });
    },
  }),
);

builder.mutationField('deleteReaction', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      emoji: t.arg.string({ validate: { maxLength: 2 } }),
      documentId: t.arg.id({ required: false }),
      articleId: t.arg.id({ required: false }),
      commentId: t.arg.id({ required: false }),
      eventId: t.arg.id({ required: false }),
    },
    async authScopes(_, { emoji, documentId, articleId, commentId, eventId }, { user }) {
      if (!user) return false;
      const reaction = await prisma.reaction.findFirst({
        where: {
          emoji,
          documentId,
          articleId,
          commentId,
          eventId,
          authorId: user.id,
        },
      });
      return Boolean(user?.admin || reaction?.authorId === user?.id);
    },
    async resolve(_query, { emoji, documentId, articleId, commentId, eventId }, { user }) {
      await log(
        'reactions',
        'delete',
        { emoji },
        commentId || documentId || articleId || eventId || '<nothing>',
        user,
      );
      await prisma.reaction.deleteMany({
        where: {
          emoji,
          documentId,
          articleId,
          commentId,
          eventId,
          authorId: user!.id,
        },
      });

      return true;
    },
  }),
);

builder.mutationField('toggleReaction', (t) =>
  t.boolean({
    args: {
      emoji: t.arg.string({ validate: { maxLength: 2 } }),
      documentId: t.arg.id({ required: false }),
      articleId: t.arg.id({ required: false }),
      commentId: t.arg.id({ required: false }),
      eventId: t.arg.id({ required: false }),
    },
    authScopes(_, { documentId, articleId, commentId, eventId }, { user }) {
      if (!user) return false;
      return Boolean(
        user?.admin ||
          // TODO only allow for articles the user can see
          articleId /* && true */ ||
          // TODO only allow for events the user can see
          eventId /* && true */ ||
          // TODO only allow for comments on stuff the user can see
          commentId /* && true */ ||
          (documentId && user?.canAccessDocuments),
      );
    },
    async resolve(_query, { emoji, documentId, articleId, commentId, eventId }, { user }) {
      await log(
        'reactions',
        'toggle',
        { emoji },
        commentId || documentId || articleId || eventId || '<nothing>',
        user,
      );
      const reaction = await prisma.reaction.findFirst({
        where: {
          emoji,
          documentId,
          articleId,
          commentId,
          eventId,
          authorId: user!.id,
        },
      });
      if (reaction) {
        await prisma.reaction.deleteMany({
          where: {
            emoji,
            documentId,
            articleId,
            commentId,
            eventId,
            authorId: user!.id,
          },
        });
        return false;
      }

      await prisma.reaction.create({
        data: {
          emoji,
          document: documentId ? { connect: { id: documentId } } : undefined,
          article: articleId ? { connect: { id: articleId } } : undefined,
          comment: commentId ? { connect: { id: commentId } } : undefined,
          event: eventId ? { connect: { id: eventId } } : undefined,
          author: { connect: { id: user!.id } },
        },
      });
      return true;
    },
  }),
);
