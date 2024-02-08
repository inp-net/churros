import { browser } from '$app/environment';
import { redirectToLogin } from '$lib/session.js';
import { loadQuery, makeMutation } from '$lib/zeus';
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

  const {
    thirdPartyApp,
    me: { allowedApps },
  } = await loadQuery(
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
      me: {
        allowedApps: {
          clientId: true,
        },
      },
    },
    { fetch, parent },
  );

  if (allowedApps.some((app) => app.clientId === clientId)) {
    const { authorize } = await makeMutation(
      {
        authorize: [
          {
            clientId,
            redirectUri: callbackUri,
          },
          {
            '__typename': true,
            '...on Error': {
              message: true,
            },
            '...on OAuth2Error': {
              code: true,
              message: true,
            },
            '...on MutationAuthorizeSuccess': {
              data: true,
            },
          },
        ],
      },
      { fetch, parent },
    );

    const redirectTo = new URL(callbackUri);
    redirectTo.search = new URLSearchParams({
      ...(authorize.__typename === 'OAuth2Error'
        ? { error: authorize.code, error_description: authorize.message }
        : authorize.__typename === 'Error'
          ? { error: 'server_error', error_description: authorize.message }
          : { code: authorize.data }),
      state: csrfState,
    }).toString();

    return redirect(302, redirectTo);
  }

  return { app: thirdPartyApp, csrfState };
}
