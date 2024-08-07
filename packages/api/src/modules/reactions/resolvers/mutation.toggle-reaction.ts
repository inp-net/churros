import { builder, log, prisma } from '#lib';
import { ReactableInterface } from '#modules/reactions/types';
import { GraphQLError } from 'graphql';

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
        if (documentId) {
          return prisma.document.findUniqueOrThrow({
            where: { id: documentId },
            include: { reactions: true },
          });
        }
        if (articleId) {
          return prisma.article.findUniqueOrThrow({
            where: { id: articleId },
            include: { reactions: true },
          });
        }
        if (commentId) {
          return prisma.comment.findUniqueOrThrow({
            where: { id: commentId },
            include: { reactions: true },
          });
        }
        if (eventId) {
          return prisma.event.findUniqueOrThrow({
            where: { id: eventId },
            include: { reactions: true },
          });
        }

        throw new GraphQLError("Pas de réaction créée, l'objet sur lequel réagir n'existe pas.");
      } else {
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
            article: { include: { reactions: true } },
            comment: { include: { reactions: true } },
            document: { include: { reactions: true } },
            event: { include: { reactions: true } },
          },
        });
        const result = article ?? comment ?? document ?? event;
        if (!result) {
          throw new GraphQLError("Pas de réaction créée, l'objet sur lequel réagir n'existe pas.");
        }
        return result;
      }
    },
  }),
);
