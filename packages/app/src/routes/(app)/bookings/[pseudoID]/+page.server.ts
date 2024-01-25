import { loadQuery, makeMutation, Selector } from '$lib/zeus';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/* @generated from schema by /packages/api/scripts/update-id-prefix-to-typename-map.ts */
const ID_PREFIXES_TO_TYPENAMES = {
  u: 'User',
  godparentreq: 'GodparentRequest',
  candidate: 'UserCandidate',
  passreset: 'PasswordReset',
  emailchange: 'EmailChange',
  service: 'Service',
  link: 'Link',
  major: 'Major',
  minor: 'Minor',
  school: 'School',
  credential: 'Credential',
  token: 'ThirdPartyCredential',
  app: 'ThirdPartyApp',
  ae: 'StudentAssociation',
  contribution: 'Contribution',
  contributionoption: 'ContributionOption',
  g: 'Group',
  a: 'Article',
  e: 'Event',
  tg: 'TicketGroup',
  t: 'Ticket',
  r: 'Registration',
  log: 'LogEntry',
  lydia: 'LydiaAccount',
  lydiapayment: 'LydiaTransaction',
  paypalpayment: 'PaypalTransaction',
  barweek: 'BarWeek',
  notifsub: 'NotificationSubscription',
  notif: 'Notification',
  ann: 'Announcement',
  ue: 'TeachingUnit',
  subj: 'Subject',
  doc: 'Document',
  comment: 'Comment',
  reac: 'Reaction',
  promocode: 'PromotionCode',
  promo: 'Promotion',
} as const;
/* end @generated from schema */











































































function reverseMap<K extends string, V extends string>(obj: Record<K, V>): Record<V, K> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k])) as unknown as Record<V, K>;
}

export const load: PageServerLoad = async ({ fetch, parent, params, url }) => {
  if (params.pseudoID.startsWith(reverseMap(ID_PREFIXES_TO_TYPENAMES).Registration + ':')) {
    throw redirect(
      301,
      url.pathname.replace(params.pseudoID, params.pseudoID.split(':')[1]!.toUpperCase()),
    );
  }

  const id = `${
    reverseMap(ID_PREFIXES_TO_TYPENAMES).Registration
  }:${params.pseudoID.toLowerCase()}`;

  let markedAsPaid = false;
  ({ checkIfRegistrationIsPaid: markedAsPaid } = await makeMutation(
    {
      checkIfRegistrationIsPaid: [{ id }, true],
    },
    {
      fetch,
      parent: async () => {
        const parentData = await parent();
        return {
          ...parentData,
          // XXX dunno why this is needed
          token: parentData.token!,
        };
      },
    },
  ));

  const { registration, registrationQRCode } = await loadQuery(
    {
      registrationQRCode: [{ id }, { path: true, viewbox: true }],
      registration: [
        {
          id,
        },
        Selector('Registration')({
          '__typename': true,
          '...on Error': {
            message: true,
          },
          '...on QueryRegistrationSuccess': {
            data: {
              createdAt: true,
              paymentMethod: true,
              id: true,
              beneficiary: true,
              beneficiaryUser: {
                uid: true,
                firstName: true,
                lastName: true,
                fullName: true,
              },
              authorIsBeneficiary: true,
              paid: true,
              opposed: true,
              cancelled: true,
              author: {
                uid: true,
                firstName: true,
                lastName: true,
                fullName: true,
              },
              authorEmail: true,
              ticket: {
                price: true,
                basePrice: true,
                name: true,
                group: {
                  name: true,
                },
                links: {
                  computedValue: true,
                  name: true,
                },
                event: {
                  uid: true,
                  title: true,
                  startsAt: true,
                  group: { uid: true },
                },
              },
            },
          },
        }),
      ],
    },
    {
      fetch,
      parent: async () => {
        const parentData = await parent();
        return {
          ...parentData,
          // XXX dunno why this is needed
          token: parentData.token!,
        };
      },
    },
  );

  if (registration.__typename === 'Error') throw error(400, registration.message);

  return { registration: registration.data, registrationQRCode, markedAsPaid };
};
