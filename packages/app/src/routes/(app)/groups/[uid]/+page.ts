import { byMemberGroupTitleImportance } from '$lib/sorting';
import { loadQuery, Selector } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me, canListPages } = await parent();
  const itemsQuery = Selector('GroupShopItemsConnection')({
    nodes: {
      uid: true,
      id: true,
      localID: true,
      name: true,
      price: true,
      max: true,
      descriptionHtml: true,
      stock: true,
      stockLeft: true,
      pictures: {
        id: true,
        path: true,
        position: true,
      },
      group: {
        uid: true,
      },
      visibility: true,
    },
  });
  const data = await loadQuery(
    {
      group: [
        params,
        me && !me.external
          ? // Authenticated query
            {
              id: true,
              localID: true,
              canEditDetails: true,
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
              roomIsOpen: true,
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
                id: true,
                localID: true,
                visibility: true,
                uid: true,
                title: true,
                bodyHtml: true,
                bodyPreview: true,
                pictureFile: true,
                author: {
                  firstName: true,
                  lastName: true,
                  uid: true,
                  fullName: true,
                  pictureFile: true,
                },
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
              events: [
                {},
                {
                  edges: {
                    node: {
                      id: true,
                      localID: true,
                      descriptionHtml: true,
                      descriptionPreview: true,
                      uid: true,
                      frequency: true,
                      recurringUntil: true,
                      myReactions: true,
                      reactionCounts: true,
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
                      tickets: {
                        name: true,
                        price: true,
                        uid: true,
                        opensAt: true,
                        closesAt: true,
                        placesLeft: true,
                        capacity: true,
                      },
                      group: {
                        uid: true,
                        pictureFile: true,
                        pictureFileDark: true,
                        name: true,
                      },
                      coOrganizers: {
                        uid: true,
                        pictureFile: true,
                        pictureFileDark: true,
                        name: true,
                      },
                    },
                  },
                },
              ],
              shopItems: [{}, itemsQuery],
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
              website: true,
              email: true,
              selfJoinable: true,
              articles: {
                id: true,
                localID: true,
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
              events: [
                {},
                {
                  edges: {
                    node: {
                      id: true,
                      localID: true,
                      descriptionHtml: true,
                      descriptionPreview: true,
                      frequency: true,
                      recurringUntil: true,
                      myReactions: true,
                      reactionCounts: true,
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
                      group: {
                        uid: true,
                        pictureFile: true,
                        pictureFileDark: true,
                        name: true,
                      },
                      tickets: {
                        name: true,
                        price: true,
                        uid: true,
                        opensAt: true,
                        closesAt: true,
                        placesLeft: true,
                        capacity: true,
                      },
                    },
                  },
                },
              ],
              shopItems: [{}, itemsQuery],
            },
      ],
    },
    { fetch, parent },
  );

  return {
    ...data,
    group: {
      ...data.group,
      members: data.group.members?.sort(byMemberGroupTitleImportance),
      canListPages,
    },
    itemsOfGroup: data.group.shopItems.nodes,
  };
};
