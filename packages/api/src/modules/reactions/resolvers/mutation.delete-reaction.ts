import { builder, log, prisma } from '#lib';

builder.mutationField('deleteReaction', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      emoji: t.arg.string({ validate: { maxLength: 2 } }),
      documentId: t.arg.id({ required: false }),
      articleId: t.arg.id({ required: false }),
      eventId: t.arg.id({ required: false }),
    },
    async authScopes(_, { emoji, documentId, articleId, eventId }, { user }) {
      if (!user) return false;
      const reaction = await prisma.reaction.findFirst({
        where: {
          emoji,
          documentId,
          articleId,
          eventId,
          authorId: user.id,
        },
      });
      return Boolean(user?.admin || reaction?.authorId === user?.id);
    },
    async resolve(_query, { emoji, documentId, articleId, eventId }, { user }) {
      await log(
        'reactions',
        'delete',
        { emoji },
        documentId || articleId || eventId || '<nothing>',
        user,
      );
      await prisma.reaction.deleteMany({
        where: {
          emoji,
          documentId,
          articleId,
          eventId,
          authorId: user!.id,
        },
      });

      return true;
    },
  }),
);
