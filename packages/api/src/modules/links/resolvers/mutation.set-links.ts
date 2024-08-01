import { builder, ensureGlobalId, log, prisma, splitID } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { LinkInput } from '#modules/links';
import { canEditArticle } from '#modules/posts';
import { queryFromInfo } from '@pothos/plugin-prisma';
import { GraphQLError } from 'graphql';
import { HasLinks } from '../types/has-links.js';

builder.mutationField('setLinks', (t) =>
  t.field({
    type: HasLinks,
    description: "Définir les liens d'une ressource implémentant `HasLinks`",
    args: {
      id: t.arg.id({ description: 'ID complet de la ressource (AVEC le préfixe)' }),
      links: t.arg({
        type: [LinkInput],
      }),
    },
    async authScopes(_, { id }, { user }) {
      const [typename, __] = splitID(id);
      switch (typename) {
        case 'Event': {
          const event = await prisma.event.findUniqueOrThrow({
            where: { id },
            include: canEditEventPrismaIncludes,
          });
          return canEditEvent(event, user);
        }
        case 'Article': {
          const article = await prisma.article.findUniqueOrThrow({
            where: { id },
            include: { author: true },
          });
          return canEditArticle(article, article, user);
        }
        default: {
          throw new GraphQLError('Cette ressource ne permet pas de définir des liens');
        }
      }
    },
    async resolve(_, { id, links }, context, info) {
      const { user } = context;
      const [typeName, __] = splitID(id);
      const queryFor = <T extends string>(typeName: T) =>
        queryFromInfo({ context, info, typeName });
      switch (typeName) {
        case 'Article': {
          await log('posts', 'set-links', { id, links }, ensureGlobalId(id, 'Article'), user);
          const query = queryFor('Article');
          return prisma.article.update({
            ...query,
            include: {
              ...('include' in query ? query.include : undefined),
              links: true,
            },
            where: { id: ensureGlobalId(id, 'Article') },
            data: {
              links: {
                deleteMany: {},
                createMany: {
                  data: links.map((l) => ({
                    name: l.text,
                    value: l.url,
                  })),
                },
              },
            },
          });
        }
        case 'Event': {
          await log('event', 'set-links', { id, links }, ensureGlobalId(id, 'Event'), user);
          const query = queryFor('Event');
          return prisma.event.update({
            ...query,
            include: {
              ...('include' in query ? query.include : undefined),
              links: true,
            },
            where: { id: ensureGlobalId(id, 'Event') },
            data: {
              links: {
                deleteMany: {},
                createMany: {
                  data: links.map((l) => ({
                    name: l.text,
                    value: l.url,
                  })),
                },
              },
            },
          });
        }
      }
      throw new GraphQLError('Cette ressource ne permet pas de définir des liens');
    },
  }),
);
