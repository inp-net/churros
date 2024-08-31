import { builder, log, prisma, splitID } from '#lib';
import { ReactableInterface } from '#modules/reactions/types';
import { GraphQLError } from 'graphql';
import { connection, whereClause } from '../utils/prisma.js';

builder.mutationField('react', (t) =>
  t.field({
    type: ReactableInterface,
    args: {
      emoji: t.arg.string({ validate: { maxLength: 2 } }),
      target: t.arg.id({ description: 'La ressource à laquelle réagir. ID global, avec préfixe.' }),
    },
    authScopes: {
      loggedIn: true,
    },
    async resolve(_, { emoji, target }, { user }) {
      await log('reactions', 'react', { emoji }, target, user);

      const typename = splitID(target)[0];

      await prisma.reaction.upsert({
        where: whereClause({ id: target, emoji, authorId: user!.id }),
        create: { emoji, ...connection(target), author: { connect: { id: user!.id } } },
        update: {
          emoji,
          ...connection(target),
        },
      });

      switch (typename) {
        case 'Document': {
          return prisma.document.findUniqueOrThrow({
            where: { id: target },
            include: { reactions: true },
          });
        }
        case 'Article': {
          return prisma.article.findUniqueOrThrow({
            where: { id: target },
            include: { reactions: true },
          });
        }
        case 'Comment': {
          return prisma.comment.findUniqueOrThrow({
            where: { id: target },
            include: { reactions: true },
          });
        }
        case 'Event': {
          return prisma.event.findUniqueOrThrow({
            where: { id: target },
            include: { reactions: true },
          });
        }
        default: {
          throw new GraphQLError(
            `Impossible de réagir sur une ressource de type ${splitID(target)[0]}`,
          );
        }
      }
    },
  }),
);
