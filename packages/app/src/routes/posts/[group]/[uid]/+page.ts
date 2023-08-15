import { Selector, loadQuery } from '$lib/zeus.js';
import type { PageLoad } from './$types';

export const _articleQuery = Selector('Article')({
  uid: true,
  title: true,
  bodyHtml: true,
  publishedAt: true,
  group: {
    uid: true,
    name: true,
  },
  pictureFile: true,
  author: {
    firstName: true,
    fullName: true,
    lastName: true,
    pictureFile: true,
    uid: true,
    groups: { group: { name: true, uid: true }, title: true },
  },
  event: {
    id: true,
    uid: true,
    title: true,
    startsAt: true,
    endsAt: true,
    descriptionHtml: true,
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
    author: {
      uid: true,
      fullName: true,
      pictureFile: true,
      groups: { group: { name: true, uid: true }, title: true },
    },
    contactMail: true,
  },
  links: {
    name: true,
    computedValue: true,
  },
});

export const load: PageLoad = async ({ fetch, params, parent }) =>
  loadQuery(
    {
      article: [{ uid: params.uid, groupUid: params.group }, _articleQuery],
    },
    { fetch, parent }
  );
