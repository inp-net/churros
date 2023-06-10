import { builder } from '../builder';
import {
  type Event as EventPrisma,
  EventVisibility as EventPrismaVisibility,
  EventVisibility,
} from '@prisma/client';
import { toHtml } from '../services/markdown';
import { prisma } from '../prisma';
import { DateTimeScalar } from './scalars';
import { mappedGetAncestors } from 'arborist';
import slug from 'slug';
import { LinkInput } from './links';
import { EventManagerType } from './event-managers';
import type { Context } from '../context';

export const EventEnumVisibility = builder.enumType(EventPrismaVisibility, {
  name: 'EventVisibility',
});

export const EventType = builder.prismaNode('Event', {
  id: { field: 'id' },
  fields: (t) => ({
    authorId: t.exposeID('authorId', { nullable: true }),
    groupId: t.exposeID('groupId'),
    contactMail: t.exposeString('contactMail'),
    beneficiary: t.relation('beneficiary', { nullable: true }),
    description: t.exposeString('description'),
    descriptionHtml: t.string({ resolve: async ({ description }) => toHtml(description) }),
    slug: t.exposeString('slug'),
    title: t.exposeString('title'),
    startsAt: t.expose('startsAt', { type: DateTimeScalar }),
    endsAt: t.expose('endsAt', { type: DateTimeScalar }),
    location: t.exposeString('location'),
    visibility: t.expose('visibility', { type: EventEnumVisibility }),
    managers: t.relation('managers'),
    tickets: t.relation('tickets'),
    ticketGroups: t.relation('ticketGroups'),
    articles: t.relation('articles'),
    group: t.relation('group'),
    links: t.relation('links'),
    author: t.relation('author', { nullable: true }),
  }),
});

builder.queryField('event', (t) =>
  t.prismaField({
    type: EventType,
    args: {
      slug: t.arg.string(),
    },
    resolve: async (query, _, { slug }) =>
      prisma.event.findFirstOrThrow({ ...query, where: { slug } }),
  })
);

builder.queryField('events', (t) =>
  t.prismaConnection({
    type: EventType,
    cursor: 'id',
    async resolve(query, _, {}, { user }) {
      if (!user) {
        return prisma.event.findMany({
          ...query,
          where: { visibility: EventPrismaVisibility.Public },
        });
      }

      console.log(`User ${user.id} is fetching events`);

      const ancestors = await prisma.group
        .findMany({
          where: { familyId: { in: user.groups.map(({ group }) => group.familyId) } },
          select: { id: true, parentId: true, uid: true },
        })
        .then((groups) => mappedGetAncestors(groups, user.groups, { mappedKey: 'groupId' }))
        .then((groups) => groups.flat());

      console.log(`User ${user.id} has ${JSON.stringify(ancestors.map((g) => g.id))} ancestors`);

      return prisma.event.findMany({
        ...query,
        where: {
          visibility: {
            notIn: [EventPrismaVisibility.Private, EventPrismaVisibility.Unlisted],
          },
          OR: [
            // Completely public events
            {
              visibility: EventPrismaVisibility.Public,
            },
            // Events in the user's groups
            {
              group: {
                uid: {
                  in: ancestors.map(({ uid }) => uid),
                },
              },
            },
          ],
        },
        orderBy: { startsAt: 'desc' },
      });
    },
  })
);

builder.mutationField('createEvent', (t) =>
  t.prismaField({
    type: EventType,
    args: {
      groupUid: t.arg.string(),
      title: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      body: t.arg.string(),
      visibility: t.arg({ type: EventEnumVisibility }),
      startsAt: t.arg({ type: DateTimeScalar }),
      endsAt: t.arg({ type: DateTimeScalar }),
      location: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      beneficiary: t.arg.id(),
    },
    authScopes: (_, { groupUid }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(
            ({ group: { uid }, canEditArticles }) => canEditArticles && uid === groupUid
          )
      ),
    resolve: (
      query,
      _,
      { groupUid, title, body, visibility, startsAt, endsAt, beneficiary, location },
      { user }
    ) =>
      prisma.event.create({
        ...query,
        data: {
          group: {
            connect: {
              uid: groupUid,
            },
          },
          author: { connect: { id: user!.id } },
          slug: slug(title),
          description: body,
          contactMail: user!.email,
          visibility,
          startsAt,
          endsAt,
          location,
          title,
          links: {
            create: {
              links: {},
            },
          },
          beneficiary: {
            connect: {
              id: beneficiary,
            },
          },
          managers: {
            create: {
              user: {
                connect: {
                  id: user!.id,
                },
              },
              canEdit: true,
              canEditPermissions: true,
              canVerifyRegistrations: true,
            },
          },
        },
      }),
  })
);

builder.mutationField('updateEvent', (t) =>
  t.prismaField({
    type: EventType,
    errors: {},
    args: {
      id: t.arg.id(),
      contactMail: t.arg.string(),
      lydiaAccountId: t.arg.id(),
      description: t.arg.string(),
      slug: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      title: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      startsAt: t.arg({ type: DateTimeScalar }),
      endsAt: t.arg({ type: DateTimeScalar }),
      location: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      visibility: t.arg({ type: EventEnumVisibility }),
      groupId: t.arg.id({ required: false }),
      authorId: t.arg.id({ required: false }),
      links: t.arg({ type: [LinkInput] }),
    },
    authScopes: (_, { id }, { user }) =>
      Boolean(
        user?.admin || user?.managedEvents.some(({ event, canEdit }) => event.id === id && canEdit)
      ),
    async resolve(
      query,
      _,
      {
        contactMail,
        lydiaAccountId,
        description,
        endsAt,
        links,
        location,
        id,
        slug,
        startsAt,
        title,
        visibility,
        authorId,
        groupId,
      }
    ) {
      const event = await prisma.event.findFirst({ ...query, where: { id } });
      if (!event) throw new Error('Event not found');

      return prisma.event.update({
        ...query,
        where: { id },
        data: {
          contactMail,
          description,
          endsAt,
          links: {
            update: {
              links: {
                deleteMany: {},
                createMany: { data: links },
              },
            },
          },
          location,
          slug,
          startsAt,
          title,
          visibility,
          beneficiary: {
            connect: {
              id: lydiaAccountId,
            },
          },
          authorId,
          groupId: groupId ?? undefined,
        },
      });
    },
  })
);

const ManagerOfEventInput = builder.inputType('ManagerOfEventInput', {
  fields: (t) => ({
    userId: t.field({ type: 'ID' }),
    canEdit: t.field({ type: 'Boolean' }),
    canEditPermissions: t.field({ type: 'Boolean' }),
    canVerifyRegistrations: t.field({ type: 'Boolean' }),
  }),
});

builder.mutationField('setManagersOfEvent', (t) =>
  t.prismaField({
    type: [EventManagerType],
    args: {
      eventId: t.arg.id(),
      managers: t.arg({ type: [ManagerOfEventInput] }),
    },
    authScopes: (_, { eventId }, { user }) =>
      Boolean(
        user?.admin ||
          user?.managedEvents.some(
            ({ event, canEditPermissions }) => event.id === eventId && canEditPermissions
          )
      ),
    async resolve(query, _, { eventId, managers }) {
      await prisma.event.update({
        where: { id: eventId },
        data: {
          managers: {
            deleteMany: {},
            createMany: {
              data: managers.map(
                ({ userId, canEdit, canEditPermissions, canVerifyRegistrations }) => ({
                  userId,
                  canEdit,
                  canEditPermissions,
                  canVerifyRegistrations,
                })
              ),
            },
          },
        },
      });

      return prisma.eventManager.findMany({
        ...query,
        where: {
          eventId,
        },
      });
    },
  })
);

export async function eventAccessibleByUser(event: EventPrisma | null, user: Context['user']) {
  switch (event?.visibility) {
    case EventVisibility.Public:
    case EventVisibility.Unlisted: {
      return true;
    }

    case EventVisibility.Restricted: {
      if (!user) return false;
      const ancestors = await prisma.group
        .findMany({
          where: { familyId: { in: user.groups.map(({ group }) => group.familyId) } },
          select: { id: true, parentId: true },
        })
        .then((groups) => mappedGetAncestors(groups, user.groups, { mappedKey: 'groupId' }))
        .then((groups) => groups.flat());

      return Boolean(ancestors.some(({ id }) => id === event.groupId));
    }

    case EventVisibility.Private: {
      return Boolean(user?.managedEvents.some(({ event: { id } }) => id === event.id));
    }

    default: {
      return false;
    }
  }
}

export function eventManagedByUser(event: EventPrisma, user: Context['user']) {
  if (!user) return false;
  return Boolean(user.managedEvents.some(({ event: { id } }) => id === event.id));
}
