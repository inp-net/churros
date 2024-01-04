import { loadQuery } from '$lib/zeus.js';

export const GET = async ({ fetch, request }) => {
  const authorization = request.headers.get('Authorization') ?? '';
  const { me } = await loadQuery(
    {
      me: {
        uid: true,
        fullName: true,
        email: true,
        major: {
          ldapSchool: {
            internalMailDomain: true,
          },
        },
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

  return new Response(
    JSON.stringify({
      ...me,
      ldapInternalEmail: `${me.uid}@${me.major?.ldapSchool?.internalMailDomain ?? 'external'}`,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
};
