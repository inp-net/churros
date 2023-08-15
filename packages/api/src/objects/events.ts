import { builder } from '../builder.js';
import { startOfWeek, endOfWeek } from 'date-fns';
import { createUid as createTicketUid } from './tickets.js';
import {
  type Event as EventPrisma,
  Visibility as VisibilityPrisma,
  Visibility,
  type Event,
} from '@prisma/client';
import { toHtml } from '../services/markdown.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar, FileScalar } from './scalars.js';
import { mappedGetAncestors } from 'arborist';
import slug from 'slug';
import { LinkInput } from './links.js';
import type { Context } from '../context.js';
import dichotomid from 'dichotomid';
import {
  type FuzzySearchResult,
  levenshteinFilterAndSort,
  levenshteinSorter,
  splitSearchTerms,
} from '../services/search.js';
import { dateFromNumbers } from '../date.js';
import { TicketInput } from './tickets.js';
import { TicketGroupInput } from './ticket-groups.js';
import { ManagerOfEventInput } from './event-managers.js';
// import imageType, { minimumBytes } from 'image-type';
import imageType from 'image-type';
import { GraphQLError } from 'graphql';
import { dirname, join } from 'node:path';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { scheduleShotgunNotifications } from '../services/notifications.js';

export const VisibilityEnum = builder.enumType(VisibilityPrisma, {
  name: 'Visibility',
});

export const EventType = builder.prismaNode('Event', {
  id: { field: 'id' },
  fields: (t) => ({
    authorId: t.exposeID('authorId', { nullable: true }),
    groupId: t.exposeID('groupId'),
    contactMail: t.exposeString('contactMail'),
    beneficiary: t.relation('beneficiary', { nullable: true }),
    lydiaAccountId: t.exposeID('lydiaAccountId', { nullable: true }),
    description: t.exposeString('description'),
    descriptionHtml: t.string({ resolve: async ({ description }) => toHtml(description) }),
    uid: t.exposeString('uid'),
    title: t.exposeString('title'),
    startsAt: t.expose('startsAt', { type: DateTimeScalar }),
    endsAt: t.expose('endsAt', { type: DateTimeScalar }),
    location: t.exposeString('location'),
    visibility: t.expose('visibility', { type: VisibilityEnum }),
    managers: t.relation('managers'),
    tickets: t.relation('tickets'),
    ticketGroups: t.relation('ticketGroups'),
    articles: t.relation('articles'),
    group: t.relation('group'),
    links: t.relation('links'),
    author: t.relation('author', { nullable: true }),
    pictureFile: t.exposeString('pictureFile'),
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
    args: {
      future: t.arg.boolean({ required: false }),
    },
    async resolve(query, _, { future }, { user }) {
      future = future ?? false;
      if (!user) {
        return prisma.event.findMany({
          ...query,
          where: {
            visibility: VisibilityPrisma.Public,
            startsAt: future ? { gte: new Date() } : undefined,
          },
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
            notIn: [VisibilityPrisma.Private, VisibilityPrisma.Unlisted],
          },
          startsAt: future ? { gte: new Date() } : undefined,
          OR: [
            // Completely public events
            {
              visibility: VisibilityPrisma.Public,
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

builder.queryField('eventsInWeek', (t) =>
  t.prismaField({
    type: [EventType],
    args: {
      today: t.arg({ type: DateTimeScalar }),
    },
    async resolve(query, _, { today }, { user }) {
      const dateCondition = {
        startsAt: {
          gte: startOfWeek(today, { weekStartsOn: 1 }),
          lte: endOfWeek(today, { weekStartsOn: 1 }),
        },
      };

      if (!user) {
        return prisma.event.findMany({
          ...query,
          where: { ...dateCondition, visibility: VisibilityPrisma.Public },
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
          ...dateCondition,
          visibility: {
            notIn: [VisibilityPrisma.Private, VisibilityPrisma.Unlisted],
          },
          OR: [
            // Completely public events
            {
              visibility: VisibilityPrisma.Public,
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
          where: { visibility: VisibilityPrisma.Public, group: { uid: groupUid } },
          orderBy: { startsAt: 'desc' },
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
            notIn: [VisibilityPrisma.Private, VisibilityPrisma.Unlisted],
          },
          group: {
            uid: groupUid,
          },
          OR: [
            // Completely public events
            {
              visibility: VisibilityPrisma.Public,
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
    errors: {},
    args: {
      id: t.arg.string({ required: false }),
      ticketGroups: t.arg({ type: [TicketGroupInput] }),
      tickets: t.arg({ type: [TicketInput] }),
      description: t.arg.string(),
      groupId: t.arg.string(),
      contactMail: t.arg.string(),
      links: t.arg({ type: [LinkInput] }),
      lydiaAccountId: t.arg.string({ required: false }),
      location: t.arg.string(),
      title: t.arg.string(),
      visibility: t.arg({ type: VisibilityEnum }),
      startsAt: t.arg({ type: DateTimeScalar }),
      endsAt: t.arg({ type: DateTimeScalar }),
      managers: t.arg({ type: [ManagerOfEventInput] }),
    },
    authScopes(_, { id, groupId }, { user }) {
      const creating = !id;
      if (user?.admin) return true;

      if (creating) {
        return Boolean(
          user?.canEditGroups ||
            user?.groups.some(
              ({ group, canEditArticles }) => canEditArticles && group.id === groupId
            )
        );
      }

      return Boolean(user?.managedEvents.some(({ event, canEdit }) => event.id === id && canEdit));
    },
    async resolve(
      query,
      _,
      {
        id,
        ticketGroups,
        lydiaAccountId,
        managers,
        startsAt,
        endsAt,
        tickets,
        description,
        groupId,
        contactMail,
        links,
        location,
        title,
        visibility,
      },
      { user }
    ) {
      const connectFromListOfUids = (uids: string[]) => ({ connect: uids.map((uid) => ({ uid })) });
      const connectFromListOfIds = (uids: string[]) => ({ connect: uids.map((id) => ({ id })) });
      // First, delete all the tickets and ticket groups that are not in the new list

      if (id) {
        await prisma.ticketGroup.deleteMany({
          where: {
            eventId: id,
            id: {
              notIn: ticketGroups.map(({ id }) => id ?? ''),
            },
          },
        });

        await prisma.ticket.deleteMany({
          where: {
            eventId: id,
            id: {
              notIn: tickets.map(({ id }) => id ?? ''),
            },
          },
        });
      }

      // First, create or update the event without any tickets
      const upsertData = {
        group: {
          connect: {
            id: groupId,
          },
        },
        author: {
          connect: {
            id: user!.id,
          },
        },
        description,
        contactMail,
        location,
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
      const event = await prisma.event.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          ...upsertData,
          uid: await createUid({ title, groupId }),
          links: { create: links },
          managers: {
            create: managers.map((m) => ({
              user: { connect: { uid: m.userUid } },
              canEdit: m.canEdit,
              canEditPermissions: m.canEditPermissions,
              canVerifyRegistrations: m.canVerifyRegistrations,
            })),
          },
        },
        update: {
          ...upsertData,
          links: {
            deleteMany: {},
            createMany: {
              data: links,
            },
          },
          managers: user?.managedEvents.find((m) => m.event.id === id)?.canEditPermissions
            ? {
                deleteMany: {},
                create: managers.map((m) => ({
                  user: { connect: { uid: m.userUid } },
                  canEdit: m.canEdit,
                  canEditPermissions: m.canEditPermissions,
                  canVerifyRegistrations: m.canVerifyRegistrations,
                })),
              }
            : {},
        },
      });
      // Update the existing tickets
      await Promise.all(
        tickets
          .filter((t) => Boolean(t.id))
          .map(async (ticket) =>
            prisma.ticket.update({
              where: { id: ticket.id! },
              data: {
                ...ticket,
                id: ticket.id!,
                links: {
                  deleteMany: {},
                  createMany: {
                    data: ticket.links,
                  },
                },
                openToGroups: connectFromListOfUids(ticket.openToGroups),
                openToSchools: connectFromListOfUids(ticket.openToSchools),
                openToMajors: connectFromListOfIds(ticket.openToMajors),
              },
            })
          )
      );
      // Create the new tickets
      for (const [i, ticket] of Object.entries(tickets.filter((t) => !t.id))) {
        const newTicket = await prisma.ticket.create({
          data: {
            ...ticket,
            links: {
              create: ticket.links,
            },
            id: undefined,
            openToGroups: connectFromListOfUids(ticket.openToGroups),
            openToSchools: connectFromListOfUids(ticket.openToSchools),
            openToMajors: connectFromListOfIds(ticket.openToMajors),
            eventId: event.id,
            uid: await createTicketUid(ticket.name),
          },
        });

        tickets[Number.parseInt(i, 10)] = { ...ticket, id: newTicket.id };
      }

      // Create the group's new tickets
      for (const [i, ticketGroup] of Object.entries(ticketGroups)) {
        for (const [j, ticket] of Object.entries(ticketGroup.tickets.filter((t) => !t.id))) {
          const newTicket = await prisma.ticket.create({
            data: {
              ...ticket,
              links: {
                create: ticket.links,
              },
              id: undefined,
              openToGroups: connectFromListOfUids(ticket.openToGroups),
              openToSchools: connectFromListOfUids(ticket.openToSchools),
              openToMajors: connectFromListOfIds(ticket.openToMajors),
              eventId: event.id,
              uid: await createTicketUid(ticket.name),
            },
          });

          ticketGroups[Number.parseInt(i, 10)]!.tickets[Number.parseInt(j, 10)] = {
            ...ticket,
            id: newTicket.id,
          };
        }
      }

      // Update the existing ticket groups
      await Promise.all(
        ticketGroups
          .filter((t) => Boolean(t.id))
          .map(async (ticketGroup) =>
            prisma.ticketGroup.update({
              where: { id: ticketGroup.id! },
              data: {
                capacity: ticketGroup.capacity,
                name: ticketGroup.name,
                tickets: {
                  set: ticketGroup.tickets.map(({ id }) => ({ id: id! })),
                },
              },
            })
          )
      );

      // Create the new ticket groups
      for (const [i, ticketGroup] of Object.entries(ticketGroups.filter((t) => !t.id))) {
        const newTicketGroup = await prisma.ticketGroup.create({
          data: {
            ...ticketGroup,
            id: undefined,
            eventId: event.id,
            tickets: {
              connect: ticketGroup.tickets.map(({ id }) => ({ id: id! })),
            },
          },
        });
        ticketGroups[Number.parseInt(i, 10)] = { ...ticketGroup, id: newTicketGroup.id };
      }

      const result = await prisma.event.findUniqueOrThrow({
        ...query,
        where: { id: event.id },
      });

      const finalEvent = await prisma.event.findUniqueOrThrow({
        where: { id: event.id },
        include: {
          tickets: true,
          group: true,
          ticketGroups: {
            include: {
              tickets: true,
            },
          },
        },
      });

      await scheduleShotgunNotifications(finalEvent);

      return result;
    },
  })
);

export async function eventAccessibleByUser(
  event: EventPrisma | null,
  user: Context['user']
): Promise<boolean> {
  if (user?.admin) return true;

  switch (event?.visibility) {
    case Visibility.Public:
    case Visibility.Unlisted: {
      return true;
    }

    case Visibility.Restricted: {
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

    case Visibility.Private: {
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

builder.queryField('searchEvents', (t) =>
  t.prismaField({
    type: [EventType],
    args: {
      q: t.arg.string(),
      groupUid: t.arg.string({ required: false }),
    },
    async resolve(query, _, { q, groupUid }, { user }) {
      q = q.trim();
      const { searchString: search, numberTerms } = splitSearchTerms(q);
      const fuzzyIDs: FuzzySearchResult = await prisma.$queryRaw`
      SELECT "id", levenshtein(LOWER(unaccent("title")), LOWER(unaccent(${search}))) as changes
      FROM "Event"
      ORDER BY changes ASC
      LIMIT 30
      `;
      const fuzzyEvents = await prisma.event.findMany({
        ...query,
        where: {
          id: {
            in: fuzzyIDs.map(({ id }) => id),
          },
          ...(groupUid ? { group: { uid: groupUid } } : {}),
        },
      });
      const results = await prisma.event.findMany({
        ...query,
        where: {
          ...(groupUid ? { group: { uid: groupUid } } : {}),
          OR: [
            { uid: { search } },
            { title: { search } },
            { description: { search } },
            numberTerms.length > 0
              ? {
                  AND: [
                    {
                      startsAt: {
                        gte: dateFromNumbers(numberTerms),
                      },
                    },
                    {
                      endsAt: { lte: dateFromNumbers(numberTerms) },
                    },
                  ],
                }
              : {},
            { location: { search } },
            { contactMail: { search } },
          ],
        },
      });

      return [
        ...results.sort(levenshteinSorter(fuzzyIDs)),
        ...levenshteinFilterAndSort<Event>(
          fuzzyIDs,
          10,
          results.map(({ id }) => id)
        )(fuzzyEvents),
        // what in the actual name of fuck do i need this?
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      ].filter(async (event) => eventAccessibleByUser(event, user));
    },
  })
);

export async function createUid({ title, groupId }: { title: string; groupId: string }) {
  const base = slug(title);
  const n = await dichotomid(
    async (n) =>
      !(await prisma.event.findUnique({
        where: { groupId_uid: { groupId, uid: `${base}${n > 1 ? `-${n}` : ''}` } },
      }))
  );
  return `${base}${n > 1 ? `-${n}` : ''}`;
}

builder.mutationField('updateEventPicture', (t) =>
  t.field({
    type: 'String',
    args: {
      id: t.arg.id(),
      file: t.arg({ type: FileScalar }),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
      });

      return Boolean(
        // Who can edit this event?
        // The author
        user?.id === event.authorId ||
          // Other authors of the group
          user?.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === event.groupId
          )
      );
    },
    async resolve(_, { id, file }) {
      const type = await file
        // .slice(0, minimumBytes) ERROR Not implemented from Ponyfill.slice @whatwg-node/node-fetch…
        .arrayBuffer()
        .then((array) => Buffer.from(array))
        .then(async (buffer) => imageType(buffer));
      if (!type || (type.ext !== 'png' && type.ext !== 'jpg'))
        throw new GraphQLError('File format not supported');

      // Delete the existing picture
      const { pictureFile } = await prisma.event.findUniqueOrThrow({
        where: { id },
        select: { pictureFile: true },
      });

      if (pictureFile) await unlink(new URL(pictureFile, process.env.STORAGE));

      const path = join(`events`, `${id}.${type.ext}`);
      await mkdir(new URL(dirname(path), process.env.STORAGE), { recursive: true });
      await writeFile(new URL(path, process.env.STORAGE), file.stream());
      await prisma.event.update({ where: { id }, data: { pictureFile: path } });
      return path;
    },
  })
);

builder.mutationField('deleteEventPicture', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
      });

      return Boolean(
        // Who can edit this event?
        // The author
        user?.id === event.authorId ||
          // Other authors of the group
          user?.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === event.groupId
          )
      );
    },
    async resolve(_, { id }) {
      const { pictureFile } = await prisma.event.findUniqueOrThrow({
        where: { id },
        select: { pictureFile: true },
      });

      if (pictureFile) await unlink(new URL(pictureFile, process.env.STORAGE));
      await prisma.event.update({ where: { id }, data: { pictureFile: '' } });
      return true;
    },
  })
);
