import { expect, it } from 'vitest';
import { gql_external_user, gql_n7_student } from './graphql.js';

it('allows getting your own personal data', async () => {
  const { assertMe } = await gql_n7_student(/* GraphQL */ `
    query GetOwnPersonalData {
      assertMe {
        __typename
        uid
        fullName
        phone
        address
      }
    }
  `);

  expect(assertMe.__typename).toEqual('User');
});

// See dataleaks.test.ts for negative data access tests
it("allows getting other users's data", async () => {
  await gql_n7_student(/* GraphQL */ `
    query GetOtherUsersData {
      user(uid: "versairea") {
        phone
        address
        fullName
      }
    }
  `).then(({ user }) => {
    expect(user).toMatchObject({
      fullName: 'Annie Versaire',
    });
  });

  await gql_external_user(/* GraphQL */ `
    query GetOtherUsersData {
      user(uid: "versairea") {
        phone
        address
        fullName
      }
    }
  `).then(({ user }) => {
    expect(user).toMatchObject({
      fullName: 'Annie Versaire',
      phone: null,
      address: null,
    });
  });
});
