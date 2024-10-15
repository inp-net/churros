import { env } from '$env/dynamic/public';
import { setSession } from '$houdini';
import { CURRENT_VERSION } from '$lib/buildinfo';
import { inferIsMobile } from '$lib/mobile';
import { aled } from '$lib/session';
import * as Sentry from '@sentry/sveltekit';
import { text, type Handle, type HandleFetch, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import * as cookie from 'cookie';

Sentry.init({
  dsn: env.PUBLIC_SENTRY_DSN,
  release: CURRENT_VERSION,
  tracesSampleRate: 1,
});

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
  const tokenFromAuthorizationHeader = (event.request.headers.get('Authorization') ?? '').replace(
    /^Bearer /,
    '',
  );
  const cookieData = cookie.parse(event.request.headers.get('Cookie') ?? '');
  aled('hooks.server.ts: handle: parsed cookie from tokens', cookieData);
  const { token: tokenFromCookies } = cookieData;

  const token = tokenFromAuthorizationHeader || tokenFromCookies;

  event.locals.mobile = Boolean(inferIsMobile(event.request.headers.get('User-Agent') ?? ''));

  setSession(event, { token });

  const response = await resolve(event);

  if (response.url === '' && response.headers.get('content-type') === 'text/html') {
    return text(
      await response
        .clone()
        .text()
        .then((text) =>
          text
            .replace(
              '%comment_start_if_splash_disabled%',
              env.PUBLIC_DISABLE_SPLASH_SCREEN === 'true' ? '<!--' : '',
            )
            .replace(
              '%comment_end_if_splash_disabled%',
              env.PUBLIC_DISABLE_SPLASH_SCREEN === 'true' ? '-->' : '',
            ),
        ),
      {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      },
    );
  }

  return response;
});

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  const apiUrl = process.env.PUBLIC_API_URL as unknown as string;
  if (request.url.startsWith(apiUrl)) {
    request = new Request(
      request.url.replace(apiUrl, process.env.PRIVATE_API_URL as unknown as string),
      request,
    );
  }

  aled('hooks.server.ts: handleFetch', request);

  return fetch(request)
    .catch((error) => {
      console.error(error);
      throw new TypeError('Impossible de joindre le serveur.');
    })
    .then((response) => {
      return response;
    });
};

export const handleError: HandleServerError = Sentry.handleErrorWithSentry(({ error }) => {
  console.error(error);
});
