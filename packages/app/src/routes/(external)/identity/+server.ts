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

  const data = {
    ...me,
    ldapInternalEmail: `${me.uid}@${me.major?.ldapSchool?.internalMailDomain ?? 'external'}`,
  };

  console.info(`[oauth] identity(${me.uid}) = ${JSON.stringify(data)}`);

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
