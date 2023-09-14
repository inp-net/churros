import { loadQuery } from '$lib/zeus';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
  const uid = params.entity!.replace('@', '');
  let isGroup = false;
  try {
    await loadQuery(
      {
        group: [{ uid }, { __typename: true }],
      },
      {
        fetch,
        // eslint-disable-next-line @typescript-eslint/require-await
        async parent() {
          return {
            me: undefined,
            mobile: locals.mobile,
            token: undefined,
          };
        },
      }
    );
    isGroup = true;
  } catch {}

  const error = isGroup ? redirect(301, `/groups/${uid}`) : redirect(301, `/users/${uid}`);
  throw error;
};
