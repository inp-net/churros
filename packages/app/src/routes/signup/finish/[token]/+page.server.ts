import { graphql } from '$houdini';
import { route } from '$lib/ROUTES.js';
import { saveSessionToken } from '$lib/session.js';
import { redirect } from '@sveltejs/kit';

const Finish = graphql(`
  mutation FinishSignup($token: String!) {
    completeSignup(token: $token) {
      needsManualValidation
      token {
        ...SessionToken @mask_disable
      }
    }
  }
`);

export async function load(event) {
  const response = await Finish.mutate(event.params, { event });
  const token = response.data?.completeSignup.token;
  if (token) {
    saveSessionToken(event.cookies, token);
    redirect(302, route('/welcome'));
  }
  return response;
}
