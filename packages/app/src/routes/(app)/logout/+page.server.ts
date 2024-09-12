import { graphql } from '$houdini';
import { authedVia, oauthEnabled, oauthLogoutURL } from '$lib/oauth';
import { route } from '$lib/ROUTES.js';

export async function load(event) {
  const authMethod = await authedVia(event);

  if (authMethod === 'token') {
    await graphql(`
      mutation Logout {
        logout
      }
    `).mutate(null, { event });
    event.cookies.delete('token', { path: '/' });
  }

  return {
    next:
      oauthEnabled() && (authMethod === 'oauth2' || authMethod === null)
        ? oauthLogoutURL().toString()
        : route('/'),
  };
}
