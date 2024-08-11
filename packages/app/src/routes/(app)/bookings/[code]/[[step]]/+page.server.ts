import { graphql, load_PageBooking, loadAll } from '$houdini';
import { route } from '$lib/ROUTES';

const Check = graphql(`
  mutation CheckIfBookingIsPaid($code: String!) {
    checkIfBookingIsPaid(code: $code)
  }
`);

export async function load(event) {
  await Check.mutate({ code: event.params.code }, { event });
  return loadAll(
    load_PageBooking({
      event,
      variables: {
        ...event.params,
        qrCodeURLTemplate: new URL(route('/bookings/[code]', event.params.code), event.url),
      },
    }),
  );
}
