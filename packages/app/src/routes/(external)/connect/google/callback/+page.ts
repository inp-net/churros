import { graphql } from '$houdini';
import { error, redirect } from '@sveltejs/kit';

export async function load(event) {
  const { url } = event;
  const code = url.searchParams.get('code');
  if (!code) error(400, { message: 'No code provided' });

  const { registerGoogleCredential } = await graphql(`
    mutation RegisterGoogleCredential($code: String!) {
      registerGoogleCredential(code: $code) {
        __typename
        ... on ErrorInterface {
          message
        }
        ... on MutationRegisterGoogleCredentialSuccess {
          data
        }
      }
    }
  `)
    .mutate({ code }, { fetch: event.fetch })
    .then(
      (d) =>
        d.data ?? {
          registerGoogleCredential: {
            __typename: 'Error',
            message: d.errors?.map((e) => e.message).join(', ') ?? 'Erreur inattendue',
          },
        },
    );

  if (registerGoogleCredential.__typename === 'Error')
    error(400, { message: registerGoogleCredential.message });

  redirect(302, url.searchParams.get('from') ?? '/');
}
