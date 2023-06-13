import { builder } from '../builder.js';
import {
  type Event as EventPrisma,
  EventVisibility as EventPrismaVisibility,
  EventVisibility,
} from '@prisma/client';
import { toHtml } from '../services/markdown.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar } from './scalars.js';
import { mappedGetAncestors } from 'arborist';
import slug from 'slug';
import { LinkInput } from './links.js';
import type { Context } from '../context.js';

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
    uid: t.exposeString('uid'),
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
      uid: t.arg.string(),
      groupUid: t.arg.string(),
    },
    async authScopes(_, { uid, groupUid }, { user }) {
      const event = await prisma.event.findFirstOrThrow({
        where: { uid, group: { uid: groupUid } },
      });
      return eventAccessibleByUser(event, user);
    },
    resolve: async (query, _, { uid }) =>
      prisma.event.findFirstOrThrow({ ...query, where: { uid } }),
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

      const ancestors = await prisma.group
        .findMany({
          where: { familyId: { in: user.groups.map(({ group }) => group.familyId ?? group.id) } },
          select: { id: true, parentId: true, uid: true },
        })
        .then((groups) => mappedGetAncestors(groups, user.groups, { mappedKey: 'groupId' }))
        .then((groups) => groups.flat());

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

builder.queryField('eventsOfGroup', (t) =>
  t.prismaConnection({
    type: EventType,
    cursor: 'id',
    args: {
      groupUid: t.arg.string(),
    },
    async resolve(query, _, { groupUid }, { user }) {
      if (!user) {
        return prisma.event.findMany({
          ...query,
          where: { visibility: EventPrismaVisibility.Public, group: { uid: groupUid } },
        });
      }

      const ancestors = await prisma.group
        .findMany({
          where: { familyId: { in: user.groups.map(({ group }) => group.familyId ?? group.id) } },
          select: { id: true, parentId: true, uid: true },
        })
        .then((groups) => mappedGetAncestors(groups, user.groups, { mappedKey: 'groupId' }))
        .then((groups) => groups.flat());

      return prisma.event.findMany({
        ...query,
        where: {
          visibility: {
            notIn: [EventPrismaVisibility.Private, EventPrismaVisibility.Unlisted],
          },
          group: {
            uid: groupUid,
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
          uid: slug(title),
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

builder.mutationField('deleteEvent', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    authScopes(_, { id }, { user }) {
      return Boolean(
        user?.admin || user?.managedEvents.some(({ event, canEdit }) => event.id === id && canEdit)
      );
    },
    async resolve(_, { id }, {}) {
      await prisma.event.delete({
        where: { id },
      });
      return true;
    },
  })
);

builder.mutationField('upsertEvent', (t) =>
  t.prismaField({
    type: EventType,
    args: {
      id: t.arg.string({ required: false }),
      ticketGroups: t.arg({ type: ['String'] }),
      tickets: t.arg({ type: ['String'] }),
      description: t.arg.string(),
      groupUid: t.arg.string(),
      contactMail: t.arg.string(),
      links: t.arg({ type: [LinkInput] }),
      lydiaAccountId: t.arg.string({ required: false }),
      location: t.arg.string(),
      title: t.arg.string(),
      visibility: t.arg({ type: EventEnumVisibility }),
      startsAt: t.arg({ type: DateTimeScalar }),
      endsAt: t.arg({ type: DateTimeScalar }),
    },
    authScopes(_, { id, groupUid }, { user }) {
      const creating = !id;
      if (creating) {
        return Boolean(
          user?.canEditGroups ||
            user?.groups.some(
              ({ group: { uid }, canEditArticles }) => canEditArticles && uid === groupUid
            )
        );
      }

      return Boolean(
        user?.admin || user?.managedEvents.some(({ event, canEdit }) => event.id === id && canEdit)
      );
    },
    async resolve(
      query,
      _,
      {
        id,
        ticketGroups,
        lydiaAccountId,
        startsAt,
        endsAt,
        tickets,
        description,
        groupUid,
        contactMail,
        links,
        location,
        title,
        visibility,
      },
      { user }
    ) {
      console.log(lydiaAccountId);
      const upsertData = {
        group: {
          connect: {
            uid: groupUid,
          },
        },
        ticketGroups: {
          connect: ticketGroups.map((id) => ({ id })),
        },
        tickets: {
          connect: tickets.map((id) => ({ id })),
        },
        author: {
          connect: {
            id: user!.id,
          },
        },
        description,
        contactMail,
        links: {
          create: {
            links: {
              createMany: {
                data: links,
              },
            },
          },
        },
        location,
        uid: slug(title),
        title,
        visibility,
        startsAt,
        endsAt,
        beneficiary: lydiaAccountId
          ? {
              connect: {
                id: lydiaAccountId,
              },
            }
          : undefined,
      };
      return prisma.event.upsert({
        ...query,
        where: { id: id ?? undefined },
        create: upsertData,
        update: upsertData,
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
      // All managers can see the event, no matter their permissions
      if (
        eventManagedByUser(event, user, {
          canEdit: false,
          canEditPermissions: false,
          canVerifyRegistrations: false,
        })
      )
        return true;

      const ancestors = await prisma.group
        .findMany({
          where: { familyId: { in: user.groups.map(({ group }) => group.familyId ?? group.id) } },
          select: { id: true, parentId: true },
        })
        .then((groups) => mappedGetAncestors(groups, user.groups, { mappedKey: 'groupId' }))
        .then((groups) => groups.flat());

      return Boolean(ancestors.some(({ id }) => id === event.groupId));
    }

    case EventVisibility.Private: {
      // All managers can see the event, no matter their permissions
      return eventManagedByUser(event, user, {
        canEdit: false,
        canEditPermissions: false,
        canVerifyRegistrations: false,
      });
    }

    default: {
      return false;
    }
  }
}

export function eventManagedByUser(
  event: EventPrisma,
  user: Context['user'],
  { canEdit = true, canEditPermissions = false, canVerifyRegistrations = false }
) {
  if (!user) return false;
  return Boolean(
    user.managedEvents.some(
      ({ event: { id }, ...permissions }) =>
        id === event.id &&
        ((permissions.canEdit && canEdit) ||
          (permissions.canEditPermissions && canEditPermissions) ||
          (permissions.canVerifyRegistrations && canVerifyRegistrations))
    )
  );
}
