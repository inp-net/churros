import { builder, decodeGlobalID, log, prisma } from '#lib';
import { REACTABLE_TYPES } from '../utils/reactables.js';

builder.mutationField('deleteReaction', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      emoji: t.arg.string({ validate: { maxLength: 2 } }),
      target: t.arg.id({ required: true }),
    },
    async authScopes(_, { emoji, target }, { user }) {
      if (!user) return false;
      const targetType = decodeGlobalID(target).typename;

      //@ts-expect-error see https://github.com/microsoft/TypeScript/issues/26255
      if (!REACTABLE_TYPES.includes(targetType))
        throw new Error(`Impossible de réagir à un objet de type ${targetType}`);

      const reaction = await prisma.reaction.findFirst({
        where: {
          emoji,
          [`${targetType.toLowerCase()}Id`]: target, // e.g. `documentId`, `articleId`, `commentId`, `eventId`
          authorId: user.id,
        },
      });
      return Boolean(user?.admin || reaction?.authorId === user?.id);
    },
    async resolve(_query, { emoji, target }, { user }) {
      const targetType = decodeGlobalID(target).typename;

      //@ts-expect-error see https://github.com/microsoft/TypeScript/issues/26255
      if (!REACTABLE_TYPES.includes(targetType))
        throw new Error(`Impossible de réagir à un objet de type ${targetType}`);

      await log('reactions', 'delete', { emoji }, target || '<nothing>', user);
      await prisma.reaction.deleteMany({
        where: {
          emoji,
          [`${targetType.toLowerCase()}Id`]: target, // e.g. `documentId`, `articleId`, `commentId`, `eventId`
          authorId: user!.id,
        },
      });

      return true;
    },
  }),
);
