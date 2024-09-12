import { graphql } from '$houdini';
import { authedVia, oauthEnabled, oauthLogoutURL } from '$lib/oauth';
import { route } from '$lib/ROUTES.js';
import { serialize } from 'cookie';

export async function load() {
  const authMethod = await authedVia(document.cookie);

  if (authMethod === 'token') {
    await graphql(`
      mutation Logout {
        logout
      }
    `).mutate(null);
    document.cookie = serialize('token', '', {
      expires: new Date(0),
      path: '/',
    });
  }

  return {
    next:
      oauthEnabled() && (authMethod === 'oauth2' || authMethod === null)
        ? oauthLogoutURL().toString()
        : route('/'),
  };
}
