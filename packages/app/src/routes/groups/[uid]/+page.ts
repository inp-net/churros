import { byMemberGroupTitleImportance } from '$lib/sorting';
import { loadQuery, Selector } from '$lib/zeus';
import type { PageLoad } from './$types';

export const _eventQuery = Selector('QueryEventsOfGroupConnection')({
  pageInfo: { hasNextPage: true, endCursor: true },
  edges: {
    cursor: true,
    node: {
      descriptionHtml: true,
      descriptionPreview: true,
      uid: true,
      links: {
        name: true,
        value: true,
        computedValue: true,
      },
      group: {
        name: true,
        uid: true,
      },
      title: true,
      startsAt: true,
      endsAt: true,
      pictureFile: true,
      visibility: true,
      location: true,
    },
  },
});

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  const { events } = await loadQuery({ events: [{}, _eventQuery] }, { fetch, parent });
  const data = await loadQuery(
    {
      group: [
        params,
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
              website: true,
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
                bodyPreview: true,
                pictureFile: true,
                author: { firstName: true, lastName: true, uid: true, fullName: true },
                publishedAt: true,
              },
              studentAssociation: {
                name: true,
                uid: true,
                school: { name: true, color: true, uid: true },
              },
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
                bodyPreview: true,
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
              studentAssociation: {
                name: true,
                uid: true,
                school: { name: true, color: true, uid: true },
              },
              links: { name: true, value: true, computedValue: true },
              ancestors: { uid: true, name: true, pictureFile: true },
            },
      ],
    },
    { fetch, parent },
  );
  return {
    ...data,
    events: {
      ...events,
    },
    group: {
      ...data.group,
      // typescript infers data.group.members as ... | never[] when it's actually ... | undefined

      members: data.group.members?.sort(byMemberGroupTitleImportance),
    },
  };
};
