import { redirectToLogin } from '$lib/session';
import { toasts } from '$lib/toasts';
import { makeMutation } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
  const { validateEmail } = await makeMutation(
    {
      validateEmail: [
        params,
        {
          '__typename': true,
          '...on Error': { message: true },
          '...on MutationValidateEmailSuccess': {
            data: true,
          },
        },
      ],
    },
    { fetch, parent },
  );

  if (validateEmail.__typename === 'MutationValidateEmailSuccess') {
    toasts.success(`Adresse e-mail validée`, '', { lifetime: 5000 });
    throw redirectToLogin(url.searchParams.get('next')?.toString() ?? '/');
  }

  return validateEmail;
};
