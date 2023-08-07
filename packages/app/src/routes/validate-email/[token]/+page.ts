import type { PageLoad } from './$types';
import { makeMutation } from '$lib/zeus';
import { redirectToLogin } from '$lib/session';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
  const { validateEmail } = await makeMutation(
    {
      validateEmail: [
        params,
        {
          __typename: true,
          '...on Error': { message: true },
          '...on MutationValidateEmailSuccess': {
            data: true,
          },
        },
      ],
    },
    { fetch, parent }
  );

  if (validateEmail.__typename === 'MutationValidateEmailSuccess')
    throw redirectToLogin(url.searchParams.get('next')?.toString() ?? '/');

  return validateEmail;
};
