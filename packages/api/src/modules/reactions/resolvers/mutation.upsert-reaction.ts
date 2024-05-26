import { builder, decodeGlobalID, log, prisma } from '#lib';
import { REACTABLE_TYPES } from '../utils/reactables.js';

// TODO rename to mutation.react and mutation.remove-reaction (or mutation.unreact ?)

builder.mutationField('upsertReaction', (t) =>
  t.int({
    args: {
      id: t.arg.id({ required: false }),
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
    async resolve(query, { id, emoji, target }, { user }) {
      const targetType = decodeGlobalID(target).typename;
      //@ts-expect-error see https://github.com/microsoft/TypeScript/issues/26255
      if (!REACTABLE_TYPES.includes(targetType))
        throw new Error(`Impossible de réagir à un objet de type ${targetType}`);
      const upsertData = {
        emoji,
        [`${targetType.toLowerCase()}Id`]: target,
      };

      await log(
        'reactions',
        id ? 'edit-reaction' : 'react',
        upsertData,
        target || '<nothing>',
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
        where: { emoji, [targetType.toLowerCase() + 'Id']: target },
      });
    },
  }),
);
