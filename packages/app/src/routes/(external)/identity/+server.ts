import { loadQuery } from '$lib/zeus.js';

export const GET = async ({ fetch, request }) => {
  const authorization = request.headers.get('Authorization') ?? '';
  const { me } = await loadQuery(
    {
      me: {
        uid: true,
        fullName: true,
        email: true,
      },
    },
    {
      fetch,
      parent: async () => ({
        mobile: false,
        token: authorization?.replace(/^Bearer /, ''),
        me: undefined,
      }),
    },
  );

  return new Response(JSON.stringify(me), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
