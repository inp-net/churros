import type { Context } from '#lib';
import { prisma } from '#lib';
import {} from '#modules/global';
import type { Prisma } from '@prisma/client';
import * as PrismaTypes from '@prisma/client';
import { mappedGetAncestors } from 'arborist';
import { eventManagedByUser } from '../index.js';

export function visibleEventsPrismaQuery(
  user: { uid: string } | undefined,
): Prisma.EventWhereInput {
  return {
    OR: [
      {
        visibility: PrismaTypes.Visibility.Private,
        OR: [
          {
            author: { uid: user?.uid ?? '' },
          },
          {
            managers: { some: { user: { uid: user?.uid ?? '' } } },
          },
        ],
      },
      // Completely public events
      {
        visibility: PrismaTypes.Visibility.Public,
      },
      // SchoolRestricted events
      {
        visibility: PrismaTypes.Visibility.SchoolRestricted,
        OR: [
          {
            group: {
              studentAssociation: {
                school: { majors: { some: { students: { some: { uid: user?.uid ?? '' } } } } },
              },
            },
          },
          {
            coOrganizers: {
              some: {
                studentAssociation: {
                  school: {
                    majors: { some: { students: { some: { uid: user?.uid ?? '' } } } },
                  },
                },
              },
            },
          },
          {
            tickets: {
              some: {
                openToExternal: {
                  not: false,
                },
              },
            },
          },
        ],
      },
      // GroupRestricted events in the user's groups
      {
        visibility: PrismaTypes.Visibility.GroupRestricted,
        OR: [
          // TODO does not work for sub-sub groups
          {
            group: {
              familyRoot: {
                children: { some: { members: { some: { member: { uid: user?.uid ?? '' } } } } },
              },
            },
          },
          {
            group: { members: { some: { member: { uid: user?.uid ?? '' } } } },
          },
          {
            coOrganizers: { some: { members: { some: { member: { uid: user?.uid ?? '' } } } } },
          },
        ],
      },
      // Unlisted events that the user booked
      {
        visibility: PrismaTypes.Visibility.Unlisted,
        OR: [
          {
            author: { uid: user?.uid ?? '' },
          },
          {
            managers: {
              some: {
                user: { uid: user?.uid ?? '' },
              },
            },
          },
          {
            tickets: {
              some: {
                registrations: {
                  some: {
                    OR: [
                      {
                        beneficiary: user?.uid ?? '',
                      },
                      {
                        author: { uid: user?.uid ?? '' },
                      },
                    ],
                  },
                },
              },
            },
          },
        ],
      },
    ],
  };
}

export async function eventAccessibleByUser(
  event:
    | (PrismaTypes.Event & {
        coOrganizers: Array<{
          id: string;
          uid: string;
          studentAssociation?: null | { school: { uid: string } };
        }>;
        group: {
          studentAssociation?: null | { school: { uid: string } };
        };
        managers: Array<{
          user: { uid: string };

          canEdit: boolean;
          canEditPermissions: boolean;
          canVerifyRegistrations: boolean;
        }>;
        tickets: Array<{ openToExternal: boolean | null }>;
      })
    | null,
  user: Context['user'],
): Promise<boolean> {
  if (user?.admin) return true;

  if (event?.tickets.some(({ openToExternal }) => openToExternal !== false)) return true;

  switch (event?.visibility) {
    case PrismaTypes.Visibility.Public:
    case PrismaTypes.Visibility.Unlisted: {
      return true;
    }

    case PrismaTypes.Visibility.SchoolRestricted: {
      if (!user) return false;
      if (eventManagedByUser(event, user, {})) return true;
      return Boolean(
        [event.group, ...event.coOrganizers]
          .map((g) => g.studentAssociation?.school.uid)
          .filter(Boolean)
          .some((schoolUid) => user.major?.schools.some((s) => s.uid === schoolUid!)),
      );
    }

    case PrismaTypes.Visibility.GroupRestricted: {
      if (!user) return false;
      // All managers can see the event, no matter their permissions
      if (eventManagedByUser(event, user, {})) return true;

      const ancestors = await prisma.group
        .findMany({
          where: { familyId: { in: user.groups.map(({ group }) => group.familyId ?? group.id) } },
          select: { id: true, parentId: true },
        })
        .then((groups) => mappedGetAncestors(groups, user.groups, { mappedKey: 'groupId' }))
        .then((groups) => groups.flat());

      return Boolean(
        ancestors.some(({ id }) =>
          [event.groupId, ...event.coOrganizers.map((g) => g.id)].includes(id),
        ),
      );
    }

    case PrismaTypes.Visibility.Private: {
      // All managers can see the event, no matter their permissions
      return eventManagedByUser(event, user, {});
    }

    default: {
      return false;
    }
  }
}