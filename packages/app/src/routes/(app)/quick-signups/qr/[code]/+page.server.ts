import { renderQRCode } from '$lib/qrcode';
import { route } from '$lib/ROUTES.js';

export async function load({ params, url }) {
  const destinationURL = new URL(route('/signup/[qrcode]', params.code), url);
  return {
    ...renderQRCode(destinationURL.toString()),
    link: destinationURL.toString(),
  };
}
