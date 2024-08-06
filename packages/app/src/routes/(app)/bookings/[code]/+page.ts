import { route } from '$lib/ROUTES';
import type { PageBookingVariables } from './$houdini';

export const _PageBookingVariables: PageBookingVariables = async ({ url, params }) => ({
  ...params,
  qrCodeURLTemplate: new URL(route('/bookings/[code]', params.code), url),
});
