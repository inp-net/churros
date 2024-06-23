import { loadQuery } from '$lib/zeus.js';

export const GET = async ({ fetch, request }) => {
  const authorization = request.headers.get('Authorization') ?? '';
  const { me } = await loadQuery(
    {
      me: {
        uid: true,
        fullName: true,
        firstName: true,
        lastName: true,
        email: true,
        admin: true,
        major: {
          ldapSchool: {
            studentMailDomain: true,
          },
        },
        groups: {
          group: { uid: true, name: true },
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
    fullName: me.fullName.slice(0, 255),
    ldapInternalEmail: `${me.uid}@${me.major?.ldapSchool?.studentMailDomain ?? 'external'}`,
    groupsUids: me.groups.map((g) => g.group.uid),
    groupsNames: me.groups.map((g) => g.group.name),
    wikiGroupsNames: [
      'Guests',
      ...me.groups.map((g) => {
        switch (g.group.uid) {
          case 'tvn7-n7': {
            return 'TVn7';
          }
          case 'animation-n7': {
            return 'CAn7';
          }
          case 'bde-n7':
          case 'bda-n7':
          case 'bds-n7':
          case 'bdd-n7':
          case 'foy-n7': {
            return 'AEn7';
          }
          case 'robot-n7': {
            return '7Robot';
          }
          case 'net7-n7': {
            return 'net7';
          }
          case 'postulants-tvn7': {
            return 'TVn7 Guests';
          }
          case 'pony7-n7': {
            return 'pony7';
          }
          case '7fault-n7': {
            return '7Fault';
          }
        }
        return '';
      }),
      me.admin ? 'Administrators' : '',
    ].filter(Boolean),
  };

  console.info(`[oauth] identity(${me.uid}) = ${JSON.stringify(data)}`);

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
