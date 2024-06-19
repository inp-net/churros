import { loadQuery, makeMutation } from '$lib/zeus.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch, url }) {
  const email = url.searchParams.get('user');
  const password = url.searchParams.get('password');

  if (!email || !password)
    error(400, 'Paramètres manquants: user, password. Utiliser un compte de bot kiosque');

  const { login } = await makeMutation(
    {
      login: [
        { email, password },
        {
          '...on MutationLoginSuccess': {
            data: { token: true },
          },
          '...on Error': {
            message: true,
          },
        },
      ],
    },
    { fetch },
  );

  if ('message' in login) error(401, login.message);

  const { events } = await loadQuery(
    {
      events: [
        {
          future: true,
          first: Number.parseInt(url.searchParams.get('count') || '5'),
          kiosk: true,
        },
        {
          nodes: {
            id: true,
            uid: true,
            title: true,
            startsAt: true,
            endsAt: true,
            location: true,
            pictureURL: [{ dark: false }, true],
            group: {
              id: true,
              name: true,
              uid: true,
              pictureFile: true,
              pictureFileDark: true,
            },
            coOrganizers: {
              id: true,
              name: true,
              uid: true,
              pictureFile: true,
              pictureFileDark: true,
            },
          },
        },
      ],
    },
    { fetch, token: login.data.token },
  );

  if (events.nodes.length === 0)
    error(400, "Aucun évènement à venir n'est éligible au mode kiosque");

  return { ...login.data, events };
}
