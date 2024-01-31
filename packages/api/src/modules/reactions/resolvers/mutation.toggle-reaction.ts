import { builder, prisma } from '#lib';

import { log } from '../../../lib/logger.js';

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
