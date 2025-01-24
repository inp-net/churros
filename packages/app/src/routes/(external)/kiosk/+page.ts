import { graphql, load_PageKiosk } from '$houdini';
import { mutationSucceeded } from '$lib/errors.js';
import { error } from '@sveltejs/kit';

export async function load(event) {
  const email = event.url.searchParams.get('user');
  const password = event.url.searchParams.get('password');

  if (!email || !password)
    error(400, 'Paramètres manquants: user, password. Utiliser un compte de bot kiosque');

  const result = await KioskLogin.mutate({ email, password });

  if (!mutationSucceeded('login', result)) error(401, 'Connexion échouée');

  return await load_PageKiosk({
    variables: { count: Number.parseInt(event.url.searchParams.get('count') || '5') },
    metadata: { tokenOverride: result.data.login.data.token },
  });
}
graphql(`
  query PageKiosk($count: Int!) @blocking {
    events(future: true, first: $count, kiosk: true) {
      nodes {
        id
        title
        startsAt
        endsAt
        location
        pictureURL
        organizer {
          ...AvatarGroup
        }
        coOrganizers {
          ...AvatarGroup
        }
      }
    }
  }
`);

const KioskLogin = graphql(`
  mutation KioskLogin($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ... on MutationLoginSuccess {
        data {
          token
        }
      }
      ...MutationErrors
    }
  }
`);
