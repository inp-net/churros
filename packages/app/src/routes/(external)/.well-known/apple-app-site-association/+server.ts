import { env } from '$env/dynamic/public';
import { json } from '@sveltejs/kit';

export async function GET() {
  return json({
    applinks: {
      apps: [],
      details: [
        {
          appID: `${env.PUBLIC_IOS_TEAM_ID}.${env.PUBLIC_APP_PACKAGE_ID}`,
          paths: ['*'],
        },
      ],
    },
  });
}
