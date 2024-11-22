import { builder, log, prisma } from '#lib';
import { ReactableInterface } from '#modules/reactions/types';

builder.mutationField('toggleReaction', (t) =>
  t.field({
    type: ReactableInterface,
    args: {
      emoji: t.arg.string({ validate: { maxLength: 2 } }),
      documentId: t.arg.id({ required: false }),
      articleId: t.arg.id({ required: false }),
      eventId: t.arg.id({ required: false }),
    },
    authScopes(_, { documentId, articleId, eventId }, { user }) {
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
    async resolve(_query, { emoji, documentId, articleId, eventId }, { user }) {
      await log(
        'reactions',
        'toggle',
        { emoji },
        documentId || articleId || eventId || '<nothing>',
        user,
      );

      const reaction = await prisma.reaction.findFirst({
        where: {
          emoji,
          documentId,
          articleId,
          eventId,
          authorId: user!.id,
        },
        include: {
          article: { include: { reactions: true } },
          document: { include: { reactions: true } },
          event: { include: { reactions: true } },
        },
      });
      if (reaction) {
        await prisma.reaction.deleteMany({
          where: {
            emoji,
            documentId,
            articleId,
            eventId,
            authorId: user!.id,
          },
        });
        return {
          id: articleId || documentId || eventId || '',
          ...(reaction.article ?? reaction.document ?? reaction.event),
          reactions: (
            reaction.article?.reactions ??
            reaction.document?.reactions ??
            reaction.event?.reactions ??
            []
          ).filter((r) => r.authorId !== user!.id),
        };
      }

      const { article, document, event } = await prisma.reaction.create({
        data: {
          emoji,
          document: documentId ? { connect: { id: documentId } } : undefined,
          article: articleId ? { connect: { id: articleId } } : undefined,
          event: eventId ? { connect: { id: eventId } } : undefined,
          author: { connect: { id: user!.id } },
        },
        include: {
          article: { include: { reactions: true } },
          document: { include: { reactions: true } },
          event: { include: { reactions: true } },
        },
      });
      return {
        id: articleId || documentId || eventId || '',
        reactions: article?.reactions ?? document?.reactions ?? event?.reactions ?? [],
        ...(article ?? document ?? event),
      };
    },
  }),
);
