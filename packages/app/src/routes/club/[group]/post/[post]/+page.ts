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
    lastName: true,
    pictureFile: true,
    uid: true,
    groups: { group: { name: true, uid: true }, title: true },
  },
  event: {
    uid: true,
    title: true,
    startsAt: true,
    descriptionHtml: true,
    links: {
      name: true,
      computedValue: true,
    },
    tickets: {
      uid: true,
      registrations: {
        id: true,
        beneficiary: true,
        authorIsBeneficiary: true,
        beneficiaryUser: { uid: true, firstName: true, lastName: true },
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

export const load: PageLoad = async ({ fetch, params, parent }) =>
  loadQuery(
    {
      article: [{ uid: params.post, groupUid: params.group }, _articleQuery],
    },
    { fetch, parent }
  );
