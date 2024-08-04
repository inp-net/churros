import { builder, ensureGlobalId, log, prisma, splitID } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { LinkInput, MAXIMUM_LINKS } from '#modules/links';
import { canEditArticle } from '#modules/posts';
import { queryFromInfo } from '@pothos/plugin-prisma';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';
import { HasLinks } from '../types/has-links.js';

builder.mutationField('addLinks', (t) =>
  t.field({
    type: HasLinks,
    errors: { types: [Error, ZodError] },
    description: 'Ajouter des liens à une ressource implémentant `HasLinks`',
    args: {
      id: t.arg.id({ description: 'ID complet de la ressource (AVEC le préfixe)' }),
      links: t.arg({
        type: [LinkInput],
        validate: {
          maxLength: MAXIMUM_LINKS,
        },
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
          id = ensureGlobalId(id, 'Article');
          await log('posts', 'set-links', { id, links }, id, user);
          const query = queryFor('Article');
          const {
            _count: { links: linksCount },
          } = await prisma.article.findUniqueOrThrow({
            where: { id },
            select: {
              _count: {
                select: {
                  links: true,
                },
              },
            },
          });
          if (linksCount + links.length > MAXIMUM_LINKS) 
            throw new GraphQLError("Impossible d'avoir plus de 10 liens");
          
          return prisma.article.update({
            ...query,
            include: {
              ...('include' in query ? query.include : undefined),
              links: true,
            },
            where: { id },
            data: {
              links: {
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
          id = ensureGlobalId(id, 'Event');
          await log('event', 'set-links', { id, links }, id, user);
          const query = queryFor('Event');
          const {
            _count: { links: linksCount },
          } = await prisma.event.findUniqueOrThrow({
            where: { id },
            select: {
              _count: {
                select: {
                  links: true,
                },
              },
            },
          });
          if (linksCount + links.length > MAXIMUM_LINKS) 
            throw new GraphQLError("Impossible d'avoir plus de 10 liens");
          
          return prisma.event.update({
            ...query,
            include: {
              ...('include' in query ? query.include : undefined),
              links: true,
            },
            where: { id },
            data: {
              links: {
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
