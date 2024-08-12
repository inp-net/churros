import { graphql } from '$houdini';

const Check = graphql(`
  mutation CheckIfBookingIsPaid($code: String!) {
    checkIfBookingIsPaid(code: $code)
  }
`);

export async function load(event) {
  await Check.mutate({ code: event.params.code }, { event });
  return {};
}
