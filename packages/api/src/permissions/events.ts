import type { Context } from '#lib';
import { prisma } from '#lib';

import { userCanManageEvent, userIsAdminOf } from '#permissions';
import type { Prisma } from '@churros/db/prisma';
import * as PrismaTypes from '@churros/db/prisma';
import { mappedGetAncestors } from 'arborist';

export function prismaQueryVisibleEvents(
  user: { uid: string } | undefined | null,
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
          {
            tickets: {
              some: {
                openToSchools: {
                  some: {
                    majors: { some: { students: { some: { uid: user?.uid ?? '' } } } },
                  },
                },
              },
            },
          },
          {
            tickets: {
              some: {
                openToMajors: {
                  some: {
                    students: { some: { uid: user?.uid ?? '' } },
                  },
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
                        internalBeneficiary: {
                          uid: user?.uid,
                        },
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

export async function userCanAccessEvent(
  event: Prisma.EventGetPayload<{ include: typeof userCanAccessEvent.prismaIncludes }>,
  user: Context['user'],
): Promise<boolean> {
  if (userIsAdminOf(user, event?.group.studentAssociationId)) return true;

  if (event?.tickets.some(({ openToExternal }) => openToExternal !== false)) return true;

  switch (event?.visibility) {
    case PrismaTypes.Visibility.Public:
    case PrismaTypes.Visibility.Unlisted: {
      return true;
    }

    case PrismaTypes.Visibility.SchoolRestricted: {
      if (!user) return false;
      if (userCanManageEvent(event, user, {})) return true;

      const userIsStudentOfOrganizers = Boolean(
        [event.group, ...event.coOrganizers]
          .map((g) => g.studentAssociation?.school.uid)
          .filter(Boolean)
          .some((schoolUid) => user.major?.schools.some((s) => s.uid === schoolUid!)),
      );

      const userIsStudentOfSomeTicketConstraints = Boolean(
        event.tickets.some(({ openToMajors, openToSchools }) => {
          if (openToMajors.some(({ students }) => students.some(({ uid }) => uid === user.uid)))
            return true;
          if (
            openToSchools.some(({ majors }) =>
              majors.some(({ students }) => students.some(({ uid }) => uid === user.uid)),
            )
          )
            return true;
          return false;
        }),
      );

      return userIsStudentOfOrganizers || userIsStudentOfSomeTicketConstraints;
    }

    case PrismaTypes.Visibility.GroupRestricted: {
      if (!user) return false;
      // All managers can see the event, no matter their permissions
      if (userCanManageEvent(event, user, {})) return true;

      const ancestors = await prisma.group
        .findMany({
          where: { familyId: { in: user.groups.map(({ group }) => group.familyId ?? group.id) } },
          select: { id: true, parentId: true },
        })
        .then((groups) => mappedGetAncestors(groups, user.groups, { mappedKey: 'groupId' }))
        .then((groups) => groups.flat());

      if (user.groups.some(({ group }) => event.groupId === group.id)) return true;
      return Boolean(
        ancestors.some(({ id }) =>
          [event.groupId, ...event.coOrganizers.map((g) => g.id)].includes(id),
        ),
      );
    }

    case PrismaTypes.Visibility.Private: {
      // All managers can see the event, no matter their permissions
      return userCanManageEvent(event, user, {});
    }

    default: {
      return false;
    }
  }
}

userCanAccessEvent.prismaIncludes = {
  managers: { include: { user: true } },
  coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
  group: { include: { studentAssociation: { include: { school: true } } } },
  tickets: {
    include: {
      openToMajors: { include: { students: true } },
      openToSchools: { include: { majors: { include: { students: true } } } },
    },
  },
} as const satisfies Prisma.EventInclude;
