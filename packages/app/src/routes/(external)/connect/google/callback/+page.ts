import { redirectToLogin } from '$lib/session';
import { makeMutation } from '$lib/zeus.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ parent, url, fetch }) {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname, Object.fromEntries(url.searchParams.entries()));

  const code = url.searchParams.get('code');
  if (!code) error(400, { message: 'No code provided' });

  const { registerGoogleCredential } = await makeMutation(
    {
      registerGoogleCredential: [
        { code },
        {
          '__typename': true,
          '...on Error': {
            message: true,
          },
          '...on MutationRegisterGoogleCredentialSuccess': {
            data: true,
          },
        },
      ],
    },
    {
      fetch,
      parent,
    },
  );

  if (registerGoogleCredential.__typename === 'Error')
    error(400, { message: registerGoogleCredential.message });

  redirect(302, url.searchParams.get('from') ?? '/');
}
