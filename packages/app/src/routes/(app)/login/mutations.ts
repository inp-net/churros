import { graphql } from '$houdini';

export const Login = graphql(`
  mutation Login($emailOrUid: String!, $password: String!) {
    login(email: $emailOrUid, password: $password) {
      ...MutationErrors
      ... on MutationLoginSuccess {
        data {
          ...SessionToken @mask_disable
        }
      }
      ... on AwaitingValidationError {
        message
      }
    }
  }
`);
