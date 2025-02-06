import { cache, graphql } from '$houdini';
import { authedVia, oauthEnabled, oauthLogoutURL } from '$lib/oauth';
import { route } from '$lib/ROUTES.js';

export async function load(event) {
  let fullpageReload = false;
  if (authedVia(event) !== 'oauth2') {
    if (!event.url.searchParams.has('userWasDeleted')) {
      await graphql(`
        mutation Logout {
          logout
        }
      `).mutate(null, { event });
    }
    event.cookies.delete('token', { path: '/' });
    fullpageReload = true;
  }

  cache.reset();

  return {
    fullpageReload,
    next:
      oauthEnabled() && (authedVia(event) === 'oauth2' || authedVia(event) === null)
        ? oauthLogoutURL().toString()
        : route('/'),
  };
}
