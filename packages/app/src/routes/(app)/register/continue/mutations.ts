import { graphql } from '$houdini';

export const CompleteSignup = graphql(`
  mutation CompleteSignup(
    $uid: UID!
    $token: String!
    $address: String!
    $birthday: DateTime
    $firstName: String!
    $graduationYear: Int!
    $lastName: String!
    $majorId: ID
    $phone: String!
    $password: String!
    $passwordConfirmation: String!
    $cededImageRightsToTVn7: Boolean!
    $apprentice: Boolean!
  ) {
    completeSignup(
      address: $address
      apprentice: $apprentice
      birthday: $birthday
      cededImageRightsToTVn7: $cededImageRightsToTVn7
      firstName: $firstName
      graduationYear: $graduationYear
      lastName: $lastName
      majorId: $majorId
      password: $password
      passwordConfirmation: $passwordConfirmation
      phone: $phone
      token: $token
      uid: $uid
    ) {
      ... on ZodError {
        fieldErrors {
          message
          path
        }
        message
      }
      ... on Error {
        message
      }
      ... on MutationCompleteSignupSuccess {
        data {
          ... on User {
            uid
          }
        }
      }
    }
  }
`);
