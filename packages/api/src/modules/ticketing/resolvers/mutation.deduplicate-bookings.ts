import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { canScanBookings, canScanBookingsPrismaIncludes } from '#modules/ticketing';

builder.mutationField('deduplicateBookings', (t) =>
  t.int({
    description: 'Dédoublonne les réservations. Renvoie les réservations supprimées.',
    errors: {},
    args: {
      event: t.arg({
        type: LocalID,
      }),
    },
    async authScopes(_, { event }, { user }) {
      return canScanBookings(
        await prisma.event.findUniqueOrThrow({
          where: { id: ensureGlobalId(event, 'Event') },
          include: canScanBookingsPrismaIncludes,
        }),
        user,
      );
    },
    async resolve(_, args, { user }) {
      const id = ensureGlobalId(args.event, 'Event');
      await log('ticketing', 'DEDUPLICATE', { args, message: 'Deduplicating bookings' }, id, user);
      const bookings = await prisma.registration.findMany({
        where: {
          ticket: {
            eventId: id,
          },
          externalBeneficiary: null,
          OR: [{ authorId: { not: null } }, { internalBeneficiaryId: { not: null } }],
        },
      });

      // Group bookings by beneficiary id (internalBeneficiary or author)
      const bookingsByBeneficiary = new Map<string, typeof bookings>();
      for (const booking of bookings) {
        const benefId = booking.internalBeneficiaryId ?? booking.authorId;
        if (!benefId) continue;
        bookingsByBeneficiary.set(benefId, [
          ...(bookingsByBeneficiary.get(benefId) ?? []),
          booking,
        ]);
      }

      await log(
        'ticketing',
        'DEDUPLICATE/collected',
        { bookingsByBeneficiary: Object.fromEntries(bookingsByBeneficiary.entries()) },
        id,
        user,
      );

      const toDelete = new Set<(typeof bookings)[number]>();

      // Go through each group and keep only the bookings that have been paid
      for (const bookingsOfBenef of bookingsByBeneficiary.values()) {
        if (bookingsOfBenef.length <= 1) continue;
        // If no booking has been paid, don't do anything,
        // we're still awaiting payment on one of them and we don't know which one
        if (!bookingsOfBenef.some((b) => b.paid)) continue;
        const unpaidBookings = bookingsOfBenef.filter((b) => !b.paid);
        for (const unpaidBooking of unpaidBookings) 
          toDelete.add(unpaidBooking);
        
      }

      await log('ticketing', 'DEDUPLICATE/will-delete', { toDelete: [...toDelete] }, id, user);

      const { count } = await prisma.registration.deleteMany({
        where: {
          ticket: { eventId: id },
          id: {
            in: [...toDelete].map((b) => b.id),
          },
        },
      });

      await log('ticketing', 'DEDUPLICATE/deleted', { count }, id, user);

      return count;
    },
  }),
);
