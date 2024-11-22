import { log, type Capacity, type Context } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { actualPrice } from '#modules/payments';
import { userIsAdminOf } from '#permissions';
import type { Prisma, User } from '@churros/db/prisma';
import { isFuture, isPast } from 'date-fns';
import { placesLeft } from '../index.js';

export const canScanBookingsPrismaIncludes = {
  managers: true,
  group: true,
} as const satisfies Prisma.EventInclude;

export function canScanBookings(
  event: Prisma.EventGetPayload<{ include: typeof canScanBookingsPrismaIncludes }>,
  user: Context['user'],
) {
  if (userIsAdminOf(user, event.group.studentAssociationId)) return true;

  const membership = user?.groups.find(({ group }) => group.id === event.groupId);
  if (membership?.canScanEvents) return true;

  const managementship = event.managers.find((m) => m.userId === user?.id);
  return !!managementship?.canVerifyRegistrations;
}

export const canSeeAllBookingsPrismaIncludes = canScanBookingsPrismaIncludes;

export function canSeeAllBookings(
  event: Prisma.EventGetPayload<{ include: typeof canSeeAllBookingsPrismaIncludes }>,
  user: Context['user'],
) {
  return canScanBookings(event, user);
}

export const canSeeTicketPrismaIncludes = {
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
} as const satisfies Prisma.TicketInclude;

export const canSeeTicketPrismaIncludesForUser = {
  contributions: { include: { option: { include: { paysFor: { include: { school: true } } } } } },
  major: { include: { schools: true } },
  groups: { include: { group: true } },
} as const satisfies Prisma.UserInclude;

export function canSeeTicket(
  ticket: Prisma.TicketGetPayload<{ include: typeof canSeeTicketPrismaIncludes }>,
  user: null | Prisma.UserGetPayload<{ include: typeof canSeeTicketPrismaIncludesForUser }>,
): boolean {
  const {
    event,
    openToGroups,
    openToSchools,
    openToPromotions,
    openToMajors,
    openToContributors,
    openToApprentices,
    openToExternal,
  } = ticket;

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

export function canSeePlacesLeftCount(
  event: Prisma.EventGetPayload<{ include: typeof canSeePlacesLeftCount.prismaIncludes }>,
  user: Context['user'],
  placesLeft: Capacity,
) {
  return placesLeft === 0 || event.showPlacesLeft || canEditEvent(event, user);
}

canSeePlacesLeftCount.prismaIncludes = canEditEventPrismaIncludes;

export function canSeeTicketCapacity(
  event: Prisma.EventGetPayload<{ include: typeof canSeeTicketCapacity.prismaIncludes }>,
  user: Context['user'],
) {
  return event.showCapacity || canEditEvent(event, user);
}

canSeeTicketCapacity.prismaIncludes = canEditEventPrismaIncludes;

export function canMarkBookingAsPaid(
  user: Context['user'] &
    Prisma.UserGetPayload<{ include: typeof canMarkBookingAsPaid.userPrismaIncludes }>,
  booking: Prisma.RegistrationGetPayload<{ include: typeof canMarkBookingAsPaid.prismaIncludes }>,
): boolean {
  if (actualPrice(user, booking.ticket, null) === 0) return true;
  if (booking.paid) return true;
  return canSeeAllBookings(booking.ticket.event, user);
}

canMarkBookingAsPaid.prismaIncludes = {
  ticket: {
    include: {
      event: {
        include: {
          ...canSeeAllBookingsPrismaIncludes,
          ...actualPrice.prismaIncludes.event.include,
        },
      },
    },
  },
} as const satisfies Prisma.RegistrationInclude;

canMarkBookingAsPaid.userPrismaIncludes = {} as const satisfies Prisma.UserInclude;

export function userIsBookedToEvent(
  user: User | null,
  event: Prisma.EventGetPayload<{ include: typeof userIsBookedToEvent.prismaIncludes }>,
  debug?: boolean,
) {
  // TODO figure sth out???
  if (!user) return false;
  const registrationsForUser = event.tickets.flatMap((ticket) =>
    ticket.registrations.filter((reg) => {
      // Ignore cancelled registrations
      if (reg.cancelledAt) return false;
      // If the registration has an internal beneficiary, check that it's the user
      if (reg.internalBeneficiaryId) return reg.internalBeneficiaryId === user.id;

      // Otherwise, the registration is for the author, check that it's the user
      return reg.authorId === user.id;
    }),
  );
  if (debug) {
    void log(
      'ticketing',
      'debug/user-is-booked-to-event',
      { registrationsForUser },
      event.id,
      user,
    );
  }
  return registrationsForUser.length > 0;
}

userIsBookedToEvent.prismaIncludes = {
  tickets: {
    include: {
      registrations: true,
    },
  },
} as const satisfies Prisma.EventInclude;

/**
 * @returns [canBook, why]
 * @param beneficiary - can be a string if it's a beneficiary (free form) or a User if it's a churrosBeneficiary
 */
export function canBookTicket(
  // user: null | NonNullable<
  //   Context['user'] & Prisma.UserGetPayload<{ include: typeof canBookTicket.userPrismaIncludes }>
  // >,
  user: Context['user'],
  userAdditionalData: null | Prisma.UserGetPayload<{
    include: typeof canBookTicket.userPrismaIncludes;
  }>,
  beneficiary: string | User | null | undefined,
  ticket: Prisma.TicketGetPayload<{ include: typeof canBookTicket.prismaIncludes }>,
  debug?: boolean,
): [boolean, string] {
  const dret = <T extends [boolean, string]>(ret: T, data: unknown) => {
    if (debug) void log('ticketing', 'debug/can-book-ticket', { ret, data }, ticket.id, user);
    return ret;
  };
  const d = (data: unknown) => {
    if (debug) void log('ticketing', 'debug/can-book-ticket', { data }, ticket.id, user);
  };

  if (canSeeAllBookings(ticket.event, user)) return dret([true, ''], { why: 'canSeeAllBookings' });

  d({ canSeeAllBookings: false });

  if (!canSeeTicket(ticket, userAdditionalData))
    return dret([false, "Vous n'êtes pas autorisé à voir ce billet"], {});

  d({ canSeeTicket: true });

  if (ticket.opensAt && isFuture(ticket.opensAt))
    return dret([false, "Le shotgun n'est pas encore ouvert"], {});

  d({ shotgunPastOpened: true });

  if (ticket.closesAt && isPast(ticket.closesAt)) return [false, 'Le shotgun est fermé'];

  d({ shotgunPastClosed: true });

  if (ticket.onlyManagersCanProvide && !canSeeAllBookings(ticket.event, user))
    return dret([false, 'Seul un·e manager peut faire une réservation pour ce billet'], {});

  d({ managersOnlyCheck: true });

  if (!canSeeAllBookings(ticket.event, user) && user) {
    const bookingsByUser = ticket.registrations.filter((r) => r.authorId === user.id);
    if (ticket.godsonLimit > 0 && bookingsByUser.length > ticket.godsonLimit)
      return dret([false, 'Vous avez atteint la limite de parrainages pour ce billet'], {});
  }

  d({ godsonlimitCheck: true });

  if (placesLeft(ticket) <= 0) return dret([false, 'Il n’y a plus de places disponibles'], {});

  d({ placesLeftCheck: true });

  if (!canSeeAllBookings(ticket.event, user) && ticket.godsonLimit <= 0 && beneficiary)
    return dret([false, "Ce billet n'accepte pas de parrainages"], {});

  d({ godsonEnabledCheck: true });

  if (!user && beneficiary) return dret([false, 'Connectez-vous pour parrainer'], {});

  d({ godsonLoggedInCheck: true });

  if (
    // external beneficiaries can't be meaningfully checked for duplicate bookings
    typeof beneficiary !== 'string' &&
    userIsBookedToEvent(beneficiary ?? user ?? null, ticket.event, debug)
  ) {
    return dret(
      [
        false,
        beneficiary
          ? "Cette personne est déjà inscrite à l'évènement"
          : 'Vous avez déjà réservé une place pour cet événement',
      ],
      {},
    );
  }

  d({ alreadyBookedCheck: true });

  return [true, ''];
}

// TODO optimize
canBookTicket.prismaIncludes = {
  group: {
    include: {
      tickets: {
        include: {
          registrations: true,
        },
      },
    },
  },
  event: {
    include: {
      coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
      group: { include: { studentAssociation: { include: { school: true } } } },
      managers: { include: { user: true } },
      bannedUsers: true,
      tickets: {
        include: {
          registrations: true,
        },
      },
    },
  },
  openToGroups: true,
  openToSchools: true,
  openToMajors: true,
  registrations: true,
} as const satisfies Prisma.TicketInclude;

canBookTicket.userPrismaIncludes = {
  ...canSeeTicketPrismaIncludesForUser,
} as const satisfies Prisma.UserInclude;

export function canEditBooking(
  user: Context['user'],
  booking: Prisma.RegistrationGetPayload<{ include: typeof canEditBooking.prismaIncludes }>,
) {
  // Anyone can pay for a booking that's for an external user or made by someone with no account
  if (booking.externalBeneficiary || !booking.authorId) return true;
  if (!user) return false;
  if (booking.ticket.event.managers.some((m) => m.userId === user.id && m.canVerifyRegistrations))
    return true;
  return [booking.authorId, booking.internalBeneficiaryId].includes(user.id);
}

canEditBooking.prismaIncludes = {
  ticket: {
    include: {
      event: {
        include: {
          managers: true,
        },
      },
    },
  },
} as const satisfies Prisma.RegistrationInclude;
