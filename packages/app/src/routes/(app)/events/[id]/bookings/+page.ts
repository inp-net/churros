import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const _registrationsQuery = Selector('EventBookingsConnection')({
  pageInfo: { hasNextPage: true, endCursor: true },
  edges: {
    cursor: true,
    node: {
      id: true,
      paid: true,
      opposed: true,
      opposedAt: true,
      opposedBy: {
        uid: true,
        fullName: true,
        pictureFile: true,
      },
      cancelled: true,
      cancelledAt: true,
      cancelledBy: {
        uid: true,
        fullName: true,
        pictureFile: true,
      },
      authorEmail: true,
      author: {
        uid: true,
        pictureFile: true,
        firstName: true,
        lastName: true,
        fullName: true,
        major: { shortName: true },
        contributesTo: { name: true },
        graduationYear: true,
        yearTier: true,
      },
      beneficiaryUser: {
        uid: true,
        pictureFile: true,
        fullName: true,
        major: { shortName: true },
        contributesTo: { name: true },
        graduationYear: true,
        yearTier: true,
      },
      authorIsBeneficiary: true,
      beneficiary: true,
      createdAt: true,
      verifiedAt: true,
      verifiedBy: {
        uid: true,
        pictureFile: true,
        fullName: true,
      },
      paymentMethod: true,
      ticket: {
        id: true,
        name: true,
        group: {
          name: true,
        },
      },
      updatedAt: true,
    },
  },
});

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      event: [
        { id: params.id },
        Selector('Event')({
          id: true,
          bookingsCounts: { total: true, paid: true, verified: true, unpaidLydia: true },
          profitsBreakdown: { total: true },
          bookings: [{}, _registrationsQuery],
        }),
      ],
    },
    { fetch, parent },
  );
