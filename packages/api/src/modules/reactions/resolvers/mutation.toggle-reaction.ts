import { builder, decodeGlobalID, prisma } from '#lib';

import { log } from '../../../lib/logger.js';
import { REACTABLE_TYPES } from '../utils/reactables.js';

builder.mutationField('toggleReaction', (t) =>
  t.boolean({
    args: {
      emoji: t.arg.string({ validate: { maxLength: 2 } }),
      target: t.arg.id({ required: true }),
    },
    authScopes(_, {}, { user }) {
      if (!user) return false;
      return Boolean(
        true,
        // TODO only allow for objects the user can see
      );
    },
    async resolve(_query, { emoji, target }, { user }) {
      await log('reactions', 'toggle', { emoji }, target || '<nothing>', user);
      const targetType = decodeGlobalID(target).typename;
      //@ts-expect-error see https://github.com/microsoft/TypeScript/issues/26255
      if (!REACTABLE_TYPES.includes(targetType))
        throw new Error(`Impossible de réagir à un objet de type ${targetType}`);

      const reaction = await prisma.reaction.findFirst({
        where: {
          emoji,
          [`${targetType.toLowerCase()}Id`]: target,
          authorId: user!.id,
        },
      });
      if (reaction) {
        await prisma.reaction.deleteMany({
          where: {
            emoji,
            [`${targetType.toLowerCase()}Id`]: target,
            authorId: user!.id,
          },
        });
        return false;
      }

      await prisma.reaction.create({
        data: {
          emoji,
          [`${targetType.toLowerCase()}Id`]: target,
          author: { connect: { id: user!.id } },
        },
      });
      return true;
    },
  }),
);
