import { graphql } from '$houdini';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { AfterLoadEvent, RegisterContinuePageVariables } from './$houdini';
import { schemas } from './validation';

export const _RegisterContinuePageVariables: RegisterContinuePageVariables = ({ url }) => ({
  token: url.searchParams.get('token') ?? '',
});

export const _houdini_load = graphql(`
  query RegisterContinuePage($token: String!) {
    userCandidate(token: $token) {
      emailValidated
      email
      address
      birthday
      firstName
      fullName
      lastName
      majorId
      graduationYear
      phone
      schoolUid
      cededImageRightsToTVn7
      apprentice
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

export async function _houdini_afterLoad({ data, event: { url } }: AfterLoadEvent) {
  const candidate = data.RegisterContinuePage.userCandidate;
  const registerForm = await superValidate(
    {
      ...candidate,
      token: url.searchParams.get('token') ?? '',
    },
    zod(schemas.register),
  );

  return {
    ...data,
    registerForm,
  };
}
