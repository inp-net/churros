import { env } from '$env/dynamic/public';
import { json } from '@sveltejs/kit';

export async function GET() {
  return json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: env.PUBLIC_APP_PACKAGE_ID,
        sha256_cert_fingerprints: [env.PUBLIC_ANDROID_CERTIFICATE_SHA256],
      },
    },
  ]);
}
