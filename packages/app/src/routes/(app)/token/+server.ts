import { makeMutation } from '$lib/zeus.js';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const POST = async ({ request, fetch }) => {
  const { redirect_uri, client_id, username, password } = z
    .object({
      redirect_uri: z.string(),
      client_id: z.string(),
      username: z.string(),
      password: z.string(),
    })
    // eslint-disable-next-line unicorn/no-await-expression-member
    .parse(Object.fromEntries((await request.formData()).entries()));

  const { login } = await makeMutation(
    {
      login: [
        { email: username, password, clientId: client_id },
        {
          '__typename': true,
          '...on Error': { message: true },
          '...on MutationLoginSuccess': {
            data: { token: true },
          },
        },
      ],
    },
    {
      fetch,
      parent: async () => ({
        mobile: false,
      }),
    },
  );

  if (login.__typename === 'Error') throw redirect(302, '/authorize?error=invalid_credentials');

  throw redirect(302, `${redirect_uri}?${new URLSearchParams({ token: login.data.token })}`);
};
