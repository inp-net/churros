import { env as secrets } from '$env/dynamic/private';
import { env } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';
import * as Google from 'google-auth-library';

export function GET({ url }) {
  const client = new Google.OAuth2Client({
    clientId: env.PUBLIC_GOOGLE_CLIENT_ID,
    clientSecret: secrets.GOOGLE_CLIENT_SECRET,
    redirectUri: new URL('/connect/google/callback', url.origin).toString(),
  });

  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });

  redirect(302, authorizeUrl);
}
