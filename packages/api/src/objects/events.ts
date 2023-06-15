import { builder } from '../builder.js';

import {
  type Event as EventPrisma,
  Visibility as VisibilityPrisma,
  Visibility,
  type Event,
} from '@prisma/client';
import { toHtml } from '../services/markdown.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar } from './scalars.js';
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
    async resolve(query, _, {}, { user }) {
      if (!user) {
        return prisma.event.findMany({
          ...query,
          where: { visibility: VisibilityPrisma.Public },
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
    args: {
      id: t.arg.string({ required: false }),
      ticketGroups: t.arg({ type: ['String'] }),
      tickets: t.arg({ type: ['String'] }),
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
    },
    authScopes(_, { id, groupId }, { user }) {
      const creating = !id;
      if (creating) {
        return Boolean(
          user?.canEditGroups ||
            user?.groups.some(
              ({ group, canEditArticles }) => canEditArticles && group.id === groupId
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
        groupId,
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
            id: groupId,
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
        location,
        uid: await createUid({ title, groupId }),
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
        create: { ...upsertData, links: { create: links } },
        update: {
          ...upsertData,
          links: {
            deleteMany: {},
            createMany: {
              data: links,
            },
          },
        },
      });
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
      SELECT "id", levenshtein("title", ${search}) as changes
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
