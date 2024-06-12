import { loadQuery, Selector } from '$lib/zeus.js';
import type { PageLoad } from './$types';

export const _articleQuery = Selector('Article')({
  id: true,
  uid: true,
  title: true,
  bodyHtml: true,
  visibility: true,
  publishedAt: true,
  notifiedAt: true,
  canBeEdited: true,
  group: {
    id: true,
    uid: true,
    name: true,
    pictureFile: true,
    pictureFileDark: true,
  },
  pictureFile: true,
  myReactions: true,
  reactionCounts: true,
  comments: [
    {
      first: 100,
    },
    {
      edges: {
        node: {
          id: true,
          author: { uid: true, fullName: true, pictureFile: true },
          bodyHtml: true,
          body: true,
          inReplyToId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  ],
  event: {
    id: true,
    uid: true,
    title: true,
    startsAt: true,
    endsAt: true,
    frequency: true,
    recurringUntil: true,
    location: true,
    placesLeft: true,
    capacity: true,
    descriptionHtml: true,
    descriptionPreview: true,
    pictureFile: true,
    links: {
      name: true,
      computedValue: true,
    },
    tickets: {
      id: true,
      uid: true,
      registrations: {
        id: true,
        beneficiary: true,
        authorIsBeneficiary: true,
        beneficiaryUser: { uid: true, firstName: true, lastName: true, fullName: true },
        author: { uid: true },
        paid: true,
        ticket: {
          name: true,
        },
      },
      opensAt: true,
      closesAt: true,
      placesLeft: true,
      capacity: true,
      name: true,
      descriptionHtml: true,
      price: true,
    },
    group: {
      uid: true,
      pictureFile: true,
      name: true,
    },
    contactMail: true,
  },
  links: {
    name: true,
    computedValue: true,
  },
});

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { canEditGroup, token } = await parent();

  const { article } = await loadQuery(
    {
      article: [{ uid: params.uid, groupUid: params.group }, _articleQuery],
    },
    { fetch, token },
  );

  return {
    article,
    canEditGroup,
  };
};
