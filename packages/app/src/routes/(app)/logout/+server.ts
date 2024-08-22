import { graphql } from '$houdini';
import { authedVia, oauthEnabled, oauthLogoutURL } from '$lib/oauth';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
  await graphql(`
    mutation Logout {
      logout
    }
  `).mutate(null, { event });

  event.cookies.delete('token', { path: '/' });

  if (oauthEnabled() && authedVia(event) === 'oauth2') 
    redirect(307, oauthLogoutURL());
  

  redirect(307, '/');
};
