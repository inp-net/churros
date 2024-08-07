import { renderQRCode } from '$lib/qrcode';

export async function load({ params, url }) {
  const destinationURL = new URL(`/register/${params.code}`, url);
  return {
    ...renderQRCode(destinationURL.toString()),
    link: destinationURL.toString(),
  };
}
