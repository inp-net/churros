import { graphql } from '$houdini';
import { redirectToLogin } from '$lib/session';
import { toasts } from '$lib/toasts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) => {
  const { validateEmail } = await graphql(`
    mutation ValidateEmail($token: String!) {
      validateEmail(token: $token) {
        ...MutationErrors @mask_disable
        ... on MutationValidateEmailSuccess {
          data
        }
      }
    }
  `)
    .mutate({ token: params.token }, { fetch })
    .then(
      (d) =>
        d.data ?? {
          validateEmail: {
            __typename: 'Error',
            message: d.errors?.map((e) => e.message).join(', ') ?? 'Erreur inattendue',
          },
        },
    );

  if (validateEmail.__typename === 'MutationValidateEmailSuccess') {
    toasts.success(`Adresse e-mail validée`, '', { lifetime: 5000 });
    throw redirectToLogin(url.searchParams.get('next')?.toString() ?? '/');
  }

  return validateEmail;
};
