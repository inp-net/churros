import { load_PageBooking } from '$houdini';
import { route } from '$lib/ROUTES.js';

export async function load(event) {
  return load_PageBooking({
    event,
    variables: {
      ...event.params,
      qrCodeURLTemplate: new URL(route('/bookings/[code]', '[code]'), event.url),
    },
  });
}
