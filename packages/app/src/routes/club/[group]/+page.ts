import { byMemberGroupTitleImportance } from '$lib/sorting';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  const data = await loadQuery(
    {
      group: [
        { uid: params.group },
        me
          ? // Authenticated query
            {
              id: true,
              uid: true,
              type: true,
              name: true,
              pictureFile: true,
              pictureFileDark: true,
              address: true,
              color: true,
              description: true,
              longDescriptionHtml: true,
              email: true,
              groupId: true,
              related: {
                uid: true,
                name: true,
                pictureFile: true,
                pictureFileDark: true,
              },
              root: {
                groupId: true,
                description: true,
                uid: true,
                name: true,
                pictureFile: true,
                pictureFileDark: true,
                children: {
                  groupId: true,
                  description: true,
                  uid: true,
                  name: true,
                  pictureFile: true,
                  pictureFileDark: true,
                  children: {
                    groupId: true,
                    uid: true,
                    name: true,
                    pictureFile: true,
                    pictureFileDark: true,
                    description: true,
                    children: {
                      groupId: true,
                      uid: true,
                      name: true,
                      pictureFile: true,
                      pictureFileDark: true,
                      description: true,
                    },
                  },
                },
              },
              selfJoinable: true,
              ancestors: { uid: true, name: true, pictureFile: true },
              articles: {
                visibility: true,
                uid: true,
                title: true,
                bodyHtml: true,
                pictureFile: true,
                author: { firstName: true, lastName: true, uid: true, fullName: true },
                publishedAt: true,
              },
              school: { name: true, color: true },
              links: { name: true, value: true, computedValue: true },
              members: {
                member: {
                  uid: true,
                  firstName: true,
                  lastName: true,
                  pictureFile: true,
                  fullName: true,
                },
                title: true,
                president: true,
                treasurer: true,
                vicePresident: true,
                secretary: true,
              },
              events: {
                descriptionHtml: true,
                uid: true,
                links: {
                  name: true,
                  value: true,
                  computedValue: true,
                },
                title: true,
                startsAt: true,
                endsAt: true,
                pictureFile: true,
                visibility: true,
                location: true,
              },
            }
          : // Unauthenticated query
            {
              id: true,
              uid: true,
              type: true,
              name: true,
              address: true,
              pictureFile: true,
              pictureFileDark: true,
              color: true,
              description: true,
              longDescriptionHtml: true,
              email: true,
              selfJoinable: true,
              articles: {
                visibility: true,
                uid: true,
                title: true,
                bodyHtml: true,
                pictureFile: true,
                publishedAt: true,
              },
              root: {
                groupId: true,
                children: {
                  groupId: true,
                  uid: true,
                  name: true,
                  pictureFile: true,
                  children: {
                    groupId: true,
                    uid: true,
                    name: true,
                    pictureFile: true,
                  },
                },
                uid: true,
                name: true,
                pictureFile: true,
              },
              school: { name: true, color: true },
              links: { name: true, value: true, computedValue: true },
              ancestors: { uid: true, name: true, pictureFile: true },
              events: {
                descriptionHtml: true,
                uid: true,
                links: {
                  name: true,
                  value: true,
                  computedValue: true,
                },
                title: true,
                startsAt: true,
                visibility: true,
                endsAt: true,
                pictureFile: true,
                location: true,
              },
            },
      ],
    },
    { fetch, parent }
  );
  return {
    ...data,
    group: {
      ...data.group,
      // typescript infers data.group.members as ... | never[] when it's actually ... | undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      members: data.group.members?.sort(byMemberGroupTitleImportance),
    },
  };
};
