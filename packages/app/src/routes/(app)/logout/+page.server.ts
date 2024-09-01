import { graphql } from '$houdini';
import { authedVia, oauthEnabled, oauthLogoutURL } from '$lib/oauth';
import { route } from '$lib/ROUTES.js';

export async function load(event) {
  if (authedVia(event) === 'token') {
    await graphql(`
      mutation Logout {
        logout
      }
    `).mutate(null, { event });
    event.cookies.delete('token', { path: '/' });
  }

  return {
    next:
      oauthEnabled() && (authedVia(event) === 'oauth2' || authedVia(event) === null)
        ? oauthLogoutURL().toString()
        : route('/'),
  };
}
