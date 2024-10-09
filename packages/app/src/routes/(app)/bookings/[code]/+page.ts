import { graphql, load_PageBooking } from '$houdini';
import { route } from '$lib/ROUTES.js';
import { toasts } from '$lib/toasts.js';

const Check = graphql(`
  mutation CheckIfBookingIsPaid($code: String!) {
    checkIfBookingIsPaid(code: $code) {
      ...MutationErrors
      ... on MutationCheckIfBookingIsPaidSuccess {
        data {
          id
          paid
        }
      }
    }
  }
`);

export async function load(event) {
  const check = await Check.mutate({ code: event.params.code });
  toasts.mutation(
    check,
    'checkIfBookingIsPaid',
    '',
    'Impossible de vérifier si la réservation est payée',
  );
  return load_PageBooking({
    event,
    variables: {
      ...event.params,
      qrCodeURLTemplate: new URL(route('/bookings/[code]', '[code]'), event.url),
    },
  });
}
