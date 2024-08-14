import { graphql } from '$houdini';

export const CancelBooking = graphql(`
  mutation CancelBooking($code: String!) {
    cancelBooking(code: $code) {
      ... on MutationCancelBookingSuccess {
        data {
          cancelled
          cancelledAt
        }
      }
      ...MutationErrors
    }
  }
`);

export const CreateGoogleWalletPass = graphql(`
  mutation CreateGoogleWalletPass($code: String!) {
    createGoogleWalletPass(code: $code) {
      ... on MutationCreateGoogleWalletPassSuccess {
        data
      }
      ...MutationErrors
    }
  }
`);

export const MarkBookingAsPaid = graphql(`
  mutation MarkBookingAsPaid($code: String!) {
    markBookingAsPaid(code: $code) {
      ... on MutationMarkBookingAsPaidSuccess {
        data {
          paid
          verified
          verifiedAt
        }
      }
      ...MutationErrors
    }
  }
`);
