import { redirectToLogin } from '$lib/session';
import { query } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, session, url }) =>
  session.me
    ? query(
        fetch,
        {
          user: [
            { id: params.id },
            {
              id: true,
              address: true,
              biography: true,
              birthday: true,
              firstname: true,
              graduationYear: true,
              lastname: true,
              nickname: true,
              phone: true,
              pictureFile: true,
              groups: { group: { id: true, name: true, color: true }, title: true },
              links: { type: true, value: true },
              major: { name: true, schools: { name: true, color: true } },
            },
          ],
        },
        session
      )
    : redirectToLogin(url.pathname);
