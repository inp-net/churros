import { builder, prisma } from '#lib';

import { log } from '../../../lib/logger.js';

// TODO rename to mutation.react and mutation.remove-reaction (or mutation.unreact ?)

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
