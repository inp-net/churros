import { graphql, loadAll } from '$houdini';
import { load_PageSignupContinue } from '$houdini/plugins/houdini-svelte/stores/PageSignupContinue.js';
import { redirect } from '@sveltejs/kit';

graphql(`
  query PageSignupContinue($token: String!) {
    userCandidate(token: $token) {
      emailValidated
      email
      birthday
      uid
      suggestedUid
      firstName
      fullName
      lastName
      majorId
      graduationYear
      cededImageRightsToTVn7
      apprentice
      usingQuickSignup
      needsManualValidation
    }
    schoolGroups {
      names
      majors {
        id
        name
        shortName
        schools {
          name
        }
      }
    }
  }
`);

export async function load(event) {
  const token = event.url.searchParams.get('token');

  if (!token) redirect(307, '..');

  return loadAll(load_PageSignupContinue({ event, variables: { token } }));
}
