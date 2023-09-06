import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const _registrationsQuery = Selector('QueryRegistrationsOfEventConnection')({
  pageInfo: { hasNextPage: true, endCursor: true },
  edges: {
    cursor: true,
    node: {
      id: true,
      paid: true,
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
        { groupUid: params.group, uid: params.uid },
        Selector('Event')({
          id: true,
          registrationsCounts: { total: true, paid: true, verified: true, unpaidLydia: true },
        }),
      ],
      registrationsOfEvent: [
        {
          eventUid: params.uid,
          groupUid: params.group,
        },
        _registrationsQuery,
      ],
    },
    { fetch, parent }
  );
