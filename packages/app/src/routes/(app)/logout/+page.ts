import { cache, graphql } from '$houdini';
import { authedVia, oauthEnabled, oauthLogoutURL } from '$lib/oauth';
import { route } from '$lib/ROUTES.js';
import { serialize } from 'cookie';

export async function load(event) {
  let fullpageReload = false;

  const authMethod = await authedVia(document.cookie);
  if (authMethod === 'token') {
    if (!event.url.searchParams.has('userWasDeleted')) {
      await graphql(`
        mutation Logout {
          logout
        }
      `).mutate(null);
    }
    document.cookie = serialize('token', '', {
      expires: new Date(0),
      path: '/',
    });
    fullpageReload = true;
  }

  cache.reset();

  return {
    fullpageReload,
    next:
      oauthEnabled() && (authMethod === 'oauth2' || authMethod === null)
        ? oauthLogoutURL().toString()
        : route('/'),
  };
}
