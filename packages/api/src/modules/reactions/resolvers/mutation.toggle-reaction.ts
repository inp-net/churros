import { builder, log, prisma } from '#lib';
import { ReactableInterface } from '#modules/reactions/types';

builder.mutationField('toggleReaction', (t) =>
  t.field({
    type: ReactableInterface,
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
      const count = await prisma.reaction.count({
        where: {
          emoji,
          documentId,
          articleId,
          commentId,
          eventId,
        },
      });

      const reaction = await prisma.reaction.findFirst({
        where: {
          emoji,
          documentId,
          articleId,
          commentId,
          eventId,
          authorId: user!.id,
        },
        include: {
          article: true,
          comment: true,
          document: true,
          event: true,
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
        return {
          id: articleId || commentId || documentId || eventId || '',
          reacted: false,
          reactions: count - 1,
          ...(reaction.article ?? reaction.comment ?? reaction.document ?? reaction.event),
        };
      }

      const { article, comment, document, event } = await prisma.reaction.create({
        data: {
          emoji,
          document: documentId ? { connect: { id: documentId } } : undefined,
          article: articleId ? { connect: { id: articleId } } : undefined,
          comment: commentId ? { connect: { id: commentId } } : undefined,
          event: eventId ? { connect: { id: eventId } } : undefined,
          author: { connect: { id: user!.id } },
        },
        include: {
          article: true,
          comment: true,
          document: true,
          event: true,
        },
      });
      return {
        id: articleId || commentId || documentId || eventId || '',
        reacted: true,
        reactions: count + 1,
        ...(article ?? comment ?? document ?? event),
      };
    },
  }),
);
