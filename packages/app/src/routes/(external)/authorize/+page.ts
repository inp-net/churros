import { browser } from '$app/environment';
import { redirectToLogin } from '$lib/session.js';
import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';

type OAuth2AuthorizeError =
  | 'invalid_request'
  | 'unauthorized_client'
  | 'access_denied'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable';

export function _errorRedirect(err: OAuth2AuthorizeError, callbackUri: string, csrfState = '') {
  return redirect(302, `${callbackUri}?error=${err}&state=${csrfState}`);
}

export async function load({ parent, url, fetch }) {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname, Object.fromEntries(url.searchParams.entries()));

  if (!browser) console.info(`[oauth] authorize(${me.uid}, ${url.search})`);

  const callbackUri = url.searchParams.get('redirect_uri');
  const clientId = url.searchParams.get('client_id');
  const csrfState = url.searchParams.get('state') ?? '';
  const responseType = url.searchParams.get('response_type') ?? '';

  if (!callbackUri) throw new Error('No redirect_uri provided');
  if (!clientId) throw _errorRedirect('invalid_request', callbackUri, csrfState);
  if (responseType !== 'code')
    throw _errorRedirect('unsupported_response_type', callbackUri, csrfState);

  const { thirdPartyApp } = await loadQuery(
    {
      thirdPartyApp: [
        { id: clientId },
        {
          name: true,
          website: true,
          description: true,
          faviconUrl: true,
          owner: {
            id: true,
            uid: true,
            name: true,
            pictureFile: true,
            pictureFileDark: true,
          },
        },
      ],
    },
    { fetch, parent },
  );

  return { app: thirdPartyApp, csrfState };
}
