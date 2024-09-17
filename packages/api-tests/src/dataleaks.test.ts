import { expect, it } from 'vitest';
import { gql_external_user, gql_logged_out } from './graphql.js';

it('does not leak personal information to logged out users', async () => {
  expect(() =>
    gql_logged_out(/* GraphQL */ `
      query PersonalInformationIsProtectedLoggedOut {
        user(uid: "lebihae") {
          uid
          address
          phone
        }
      }
    `),
  ).rejects.toThrowError('pas autorisé');
});

it('does not leak personal information to external users', async () => {
  const { user } = await gql_external_user(/* GraphQL */ `
    query PersonalInformationIsProtectedExternal {
      user(uid: "lebihae") {
        uid
        address
        phone
      }
    }
  `);

  expect(user).toEqual({
    uid: 'lebihae',
    address: null,
    phone: null,
  });
});

it('does not leak booking codes of events', async () => {
  const { events } = await gql_logged_out(/* GraphQL */ `
    query Setup_DoesNotLeakBookingCodes {
      events(first: 1) {
        nodes {
          localID
        }
      }
    }
  `);
  expect(() =>
    gql_logged_out(
      /* GraphQL */ `
        query DoesNotLeakBookingCodes($id: LocalID!) {
          event(id: $id) {
            paidBookings: bookings(only: Paid) {
              nodes {
                code
              }
            }
            scannedBookings: bookings(only: Verified) {
              nodes {
                code
              }
            }
            unpaidBookings: bookings(only: Unpaid) {
              nodes {
                code
              }
            }
          }
        }
      `,
      {
        id: events.nodes[0]!.localID,
      },
    ),
  ).rejects.toThrowError('pas autorisé');
});
