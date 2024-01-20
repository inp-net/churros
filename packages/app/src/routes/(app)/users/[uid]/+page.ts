import { redirectToLogin } from '$lib/session';
import { byMemberGroupTitleImportance } from '$lib/sorting';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  const data = await loadQuery(
    {
      contributionOptions: {
        name: true,
        price: true,
        id: true,
        paysFor: { name: true, id: true, uid: true },
        offeredIn: { name: true, id: true, uid: true },
      },
      user: [
        params,
        {
          admin: true,
          apprentice: true,
          uid: true,
          address: true,
          birthday: true,
          createdAt: true,
          description: true,
          descriptionHtml: true,
          firstName: true,
          graduationYear: true,
          yearTier: true,
          lastName: true,
          fullName: true,
          nickname: true,
          email: true,
          otherEmails: true,
          phone: true,
          pictureFile: true,
          groups: {
            group: { uid: true, name: true, color: true, pictureFile: true, pictureFileDark: true },
            member: {
              lastName: true,
            },
            title: true,
            president: true,
            treasurer: true,
            vicePresident: true,
            secretary: true,
          },
          links: { name: true, value: true, computedValue: true },
          minor: {
            name: true,
            shortName: true,
            uid: true,
          },
          major: {
            uid: true,
            name: true,
            shortName: true,
            schools: {
              uid: true,
              name: true,
              color: true,
              studentAssociations: {
                id: true,
                name: true,
              },
            },
          },
          familyTree: {
            nesting: true,
            users: {
              uid: true,
              firstName: true,
              lastName: true,
              fullName: true,
              pictureFile: true,
              graduationYear: true,
            },
          },
          ...(me.uid === params.uid ? { pendingContributions: { name: true, id: true } } : {}),
          ...(me.canEditUsers || me.uid === params.uid
            ? {
                contributesTo: {
                  name: true,
                  id: true,
                },
              }
            : {}),
          articles: [
            {},
            {
              edges: {
                node: {
                  id: true,
                  title: true,
                  uid: true,
                  group: { uid: true, name: true, pictureFile: true, pictureFileDark: true },
                  bodyHtml: true,
                  bodyPreview: true,
                  publishedAt: true,
                  links: { value: true, name: true, computedValue: true },
                  visibility: true,
                },
              },
            },
          ],
        },
      ],
      codeContributors: {
        '__typename': true,
        '...on QueryCodeContributorsSuccess': {
          data: { uid: true },
        },
        '...on Error': {
          message: true,
        },
      },
    },
    { fetch, parent },
  );

  return {
    ...data,
    user: {
      ...data.user,
      groups: data.user.groups.sort(byMemberGroupTitleImportance),
    },
    isDeveloper:
      data.codeContributors.__typename === 'QueryCodeContributorsSuccess'
        ? data.codeContributors.data.some((c) => c.uid === data.user.uid)
        : false,
  };
};
