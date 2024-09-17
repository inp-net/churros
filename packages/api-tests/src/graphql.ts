import { initGraphQLTada } from 'gql.tada';
import request from 'graphql-request';
import type { introspection } from './graphql-env.js';

export const graphql = initGraphQLTada<{
  introspection: introspection;
  scalars: {
    DateTime: Date;
    LocalID: string;
  };
}>();

export const ENDPOINT = process.env['API_TESTS_ENDPOINT'] || 'http://localhost:4000/graphql';
export const OPERATION_NAMESPACE = process.env['API_TESTS_OPERATION_NAMESPACE'] || 'ChurrosTests';

async function _gql_namespaced<const In extends string, Variables extends Record<string, any>>(
  doc: In,
  variables?: Variables,
  headers?: Record<string, string>,
) {
  // @ts-expect-error
  return request({
    url: ENDPOINT,
    document: graphql(
      doc.replace(
        /^\s*(query|mutation|subscription) (\w+)(.+)? \{/,
        (_, $1, $2, $3) => `${$1} ${OPERATION_NAMESPACE}__${$2}${$3} {`,
      ) as In,
    ),
    variables,
    requestHeaders: headers,
  });
}

async function login(uid: string) {
  const testPassword = process.env['TEST_PASSWORD'];
  if (!testPassword) {
    throw new Error('TEST_PASSWORD is not set');
  }
  const result = await _gql_namespaced(
    /* GraphQL */ `
      mutation TestLogin($uid: String!, $password: String!) {
        login(email: $uid, password: $password) {
          ... on ErrorInterface {
            __typename
            message
          }
          ... on MutationLoginSuccess {
            data {
              token
            }
          }
        }
      }
    `,
    {
      uid,
      password: testPassword,
    },
  );
  if (!('data' in result.login)) {
    throw new Error(
      `login as ${uid} failed: ${'message' in result.login ? result.login.message : result.login.__typename}`,
    );
  }
  return result.login.data.token;
}

export async function gql<const In extends string, Variables extends Record<string, any>>(
  doc: In,
  { login, token, variables }: { token?: string; variables?: NoInfer<Variables> } = {},
) {
  return _gql_namespaced(doc, variables, token ? { Authorization: `Bearer ${token}` } : undefined);
}

let externalUserToken = process.env['API_TESTS_EXTERNAL_USER_TOKEN'];
let internalUserToken = process.env['API_TESTS_INTERNAL_USER_TOKEN'];

export async function gql_external_user<
  const In extends string,
  Variables extends Record<string, any>,
>(doc: In, variables?: Variables) {
  if (!externalUserToken) {
    externalUserToken = await login(process.env['API_TESTS_EXTERNAL_USER_UID'] || 'exte');
  }

  return gql(doc, { token: externalUserToken, variables });
}

export async function gql_logged_out<
  const In extends string,
  Variables extends Record<string, any>,
>(doc: In, variables?: Variables) {
  return gql(doc, { variables });
}

export async function gql_n7_student<
  const In extends string,
  Variables extends Record<string, any>,
>(doc: In, variables?: Variables) {
  if (!internalUserToken) {
    internalUserToken = await login(process.env['API_TESTS_INTERNAL_USER_UID'] || 'alamaternitei');
  }

  return gql(doc, { token: internalUserToken, variables });
}
