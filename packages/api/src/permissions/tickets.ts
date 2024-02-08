import { prisma } from '#lib';
import type { Prisma } from '@prisma/client';

export function userCanSeeTicket(
  {
    event,
    openToGroups,
    openToSchools,
    openToPromotions,
    openToMajors,
    openToContributors,
    openToApprentices,
    openToExternal,
  }: {
    event: {
      id: string;
      group: { studentAssociation: null | { id: string } };
      managers: Array<{ userId: string }>;
      bannedUsers: Array<{ id: string }>;
    };
    onlyManagersCanProvide: boolean;
    openToGroups: Array<{ uid: string }>;
    openToSchools: Array<{ uid: string }>;
    openToPromotions: number[];
    openToMajors: Array<{ id: string }>;
    openToContributors: boolean | null;
    openToApprentices: boolean | null;
    openToExternal: boolean | null;
  },
  user?: {
    id: string;
    admin: boolean;
    groups: Array<{ group: { uid: string } }>;
    graduationYear: number;
    major?: { schools: Array<{ uid: string }>; id: string } | null;
    contributions: Array<{
      paid: boolean;
      option: { id: string; paysFor: Array<{ id: string; school: { uid: string } }> };
    }>;
    apprentice: boolean;
  } | null,
): boolean {
  // Admins can see everything
  if (user?.admin) return true;

  if (event.managers.some(({ userId }) => userId === user?.id))
    // Managers can see everything
    return true;

  // Banned users cannot see any ticket
  if (event.bannedUsers.some(({ id }) => id === user?.id)) return false;

  // External accounts or logged-out users can only see tickets not excluded from external users
  if (openToExternal === false && !user?.major) return false;
  if (openToExternal === true && user?.major) return false;

  // Check if user is an apprentice
  if (openToApprentices === true && !user?.apprentice) return false;
  if (openToApprentices === false && user?.apprentice) return false;

  // Get the user's contributor status
  const isContributor = Boolean(
    user?.contributions.some(
      ({ option: { paysFor }, paid }) =>
        paid && paysFor.some(({ id }) => id === event.group.studentAssociation?.id),
    ),
  );

  if (openToContributors === true && !isContributor) return false;
  if (openToContributors === false && isContributor) return false;

  // Check that the user is in the group
  if (
    openToGroups.length > 0 &&
    !openToGroups.some(({ uid }) => user?.groups.some(({ group }) => group.uid === uid))
  )
    return false;

  // Check that the user is in the major
  if (openToMajors.length > 0 && !openToMajors.map((m) => m.id).includes(user?.major?.id ?? ''))
    return false;

  // Check that the user is in the school
  if (
    openToSchools.length > 0 &&
    !openToSchools.some(({ uid }) => user?.major?.schools.some((school) => school.uid === uid))
  )
    return false;

  // Check that the user in the promo
  if (openToPromotions.length > 0 && (!user || !openToPromotions.includes(user.graduationYear)))
    return false;

  return true;
}

export async function getTicketsWithConstraints(
  eventId: string,
  query: {
    include?: Prisma.TicketInclude;
    select?: Prisma.TicketSelect;
  } = {},
) {
  return await prisma.ticket.findMany({
    ...query,
    where: { eventId },
    include: {
      openToGroups: true,
      openToSchools: true,
      openToMajors: true,
      event: {
        include: {
          managers: { include: { user: true } },
          bannedUsers: true,
          group: {
            include: {
              studentAssociation: true,
            },
          },
        },
      },
    },
  });
}
