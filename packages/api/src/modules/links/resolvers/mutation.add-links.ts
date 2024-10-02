import { builder, ensureGlobalId, graphinx, log, prisma, splitID } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { canEditGroup, GroupTypePrismaIncludes } from '#modules/groups';
import { LinkInput, MAXIMUM_LINKS } from '#modules/links';
import { canEditArticle } from '#modules/posts';
import { TicketTypePrismaIncludes } from '#modules/ticketing';
import { canEditProfile, UserTypePrismaIncludes } from '#modules/users';
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
      duplicates: t.arg({
        type: builder.enumType('DuplicateLinksAction', {
          ...graphinx('links'),
          values: {
            Skip: { value: 'Skip', description: 'Ne pas ajouter' },
            Replace: { value: 'Replace', description: "Remplacer l'ancien lien" },
            Error: { value: 'Error', description: 'Provoquer une erreur' },
          },
        }),
        defaultValue: 'Replace',
        description:
          'Que faire pour un lien si la ressource en possède déjà un autre avec la même URL',
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
            include: canEditArticle.prismaIncludes,
          });
          return canEditArticle(article, article, user);
        }
        case 'Ticket': {
          const ticket = await prisma.ticket.findUniqueOrThrow({
            where: { id },
            include: {
              event: {
                include: canEditEventPrismaIncludes,
              },
            },
          });
          return canEditEvent(ticket.event, user);
        }
        case 'User': {
          const targetUser = await prisma.user.findUniqueOrThrow({
            where: { id },
            include: canEditProfile.prismaIncludes,
          });
          return canEditProfile(user, targetUser);
        }
        case 'Group': {
          const group = await prisma.group.findUniqueOrThrow({
            where: { id },
            include: canEditGroup.prismaIncludes,
          });
          return canEditGroup(user, group);
        }
        default: {
          throw new GraphQLError('Cette ressource ne permet pas de définir des liens');
        }
      }
    },
    async resolve(_, { id, links, duplicates }, context) {
      const { user } = context;
      const [typeName, __] = splitID(id);
      // TODO figure out why return type is {select: undefined}
      // const queryFor = <T extends string>(typeName: T) =>
      //   queryFromInfo({ context, info, typeName });
      switch (typeName) {
        case 'Article': {
          id = ensureGlobalId(id, 'Article');
          await log('posts', 'add-links', { id, links }, id, user);
          // const query = queryFor('Article');
          ensureLinksCountLimit(
            await prisma.article.findUniqueOrThrow({
              where: { id },
              select: ensureLinksCountLimit.prismaSelect,
            }),
            links,
          );

          return prisma.article.update({
            // ...query,
            include: {
              // ...('include' in query ? query.include : undefined),
              links: true,
              reactions: true,
            },
            where: { id },
            data: {
              links: updateLinksPrisma(links, duplicates),
            },
          });
        }
        case 'Ticket': {
          id = ensureGlobalId(id, 'Ticket');
          await log('ticketing', 'add-links', { id, links }, id, user);
          // const query = queryFor('Ticket');
          ensureLinksCountLimit(
            await prisma.ticket.findUniqueOrThrow({
              where: { id },
              select: ensureLinksCountLimit.prismaSelect,
            }),
            links,
          );

          return prisma.ticket.update({
            // ...query,
            include: {
              // ...('include' in query ? query.include : undefined),
              ...TicketTypePrismaIncludes,
              links: true,
            },
            where: { id },
            data: {
              links: updateLinksPrisma(links, duplicates),
            },
          });
        }

        case 'Event': {
          id = ensureGlobalId(id, 'Event');
          await log('event', 'add-links', { id, links }, id, user);
          // const query = queryFor('Event');
          ensureLinksCountLimit(
            await prisma.event.findUniqueOrThrow({
              where: { id },
              select: ensureLinksCountLimit.prismaSelect,
            }),
            links,
          );

          return prisma.event.update({
            // ...query,
            include: {
              // ...('include' in query ? query.include : undefined),
              links: true,
              managers: true,
              group: true,
              tickets: true,
              reactions: true,
            },
            where: { id },
            data: {
              links: updateLinksPrisma(links, duplicates),
            },
          });
        }

        case 'User': {
          id = ensureGlobalId(id, 'User');
          await log('users', 'add-links', { id, links }, id, user);
          // const query = queryFor('User');
          ensureLinksCountLimit(
            await prisma.user.findUniqueOrThrow({
              where: { id },
              select: ensureLinksCountLimit.prismaSelect,
            }),
            links,
          );

          return prisma.user.update({
            // ...query,
            include: {
              // ...('include' in query ? query.include : undefined),
              ...UserTypePrismaIncludes,
              links: true,
            },
            where: { id },
            data: {
              links: updateLinksPrisma(links, duplicates),
            },
          });
        }

        case 'Group': {
          id = ensureGlobalId(id, 'Group');
          await log('groups', 'add-links', { id, links }, id, user);
          // const query = queryFor('Group');
          ensureLinksCountLimit(
            await prisma.group.findUniqueOrThrow({
              where: { id },
              select: ensureLinksCountLimit.prismaSelect,
            }),
            links,
          );

          return prisma.group.update({
            // ...query,
            include: {
              // ...('include' in query ? query.include : undefined),
              links: true,
              ...GroupTypePrismaIncludes,
            },
            where: { id },
            data: {
              links: updateLinksPrisma(links, duplicates),
            },
          });
        }
      }
      throw new GraphQLError('Cette ressource ne permet pas de définir des liens');
    },
  }),
);

function updateLinksPrisma(
  links: Array<{ text: string; url: string }>,
  duplicates: 'Error' | 'Replace' | 'Skip',
) {
  return {
    updateMany:
      duplicates === 'Replace'
        ? links.map((l) => ({
            where: {
              value: l.url,
            },
            data: {
              name: l.text,
              value: l.url,
            },
          }))
        : [],
    createMany: {
      skipDuplicates: duplicates !== 'Error',
      data: links.map((l) => ({
        name: l.text,
        value: l.url,
      })),
    },
  } as const;
}

function ensureLinksCountLimit(currentResource: { _count: { links: number } }, links: unknown[]) {
  if (currentResource._count.links + links.length > MAXIMUM_LINKS)
    throw new GraphQLError("Impossible d'avoir plus de 10 liens");
}

ensureLinksCountLimit.prismaSelect = {
  _count: {
    select: {
      links: true,
    },
  },
} as const;
