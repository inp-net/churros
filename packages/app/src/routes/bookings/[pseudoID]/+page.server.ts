import { Selector, loadQuery } from '$lib/zeus';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

/* @generated from schema by file:///home/whidix/Documents/centraverse/packages/api/build/scripts/update-id-prefix-to-typename-map.js */ const ID_PREFIXES_TO_TYPENAMES =
  {
    u: 'User',
    candidate: 'UserCandidate',
    link: 'Link',
    major: 'Major',
    school: 'School',
    credential: 'Credential',
    ae: 'StudentAssociation',
    g: 'Group',
    a: 'Article',
    e: 'Event',
    tg: 'TicketGroup',
    t: 'Ticket',
    r: 'Registration',
    log: 'LogEntry',
    lydia: 'LydiaAccount',
    lydiapayment: 'LydiaTransaction',
    barweek: 'BarWeek',
    notifsub: 'NotificationSubscription',
    notif: 'Notification',
    notifsetting: 'NotificationSetting',
  };
/* end @generated from schema */

function reverseMap<K extends string, V extends string>(obj: Record<K, V>): Record<V, K> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k])) as unknown as Record<V, K>;
}

export const load: PageServerLoad = async ({ fetch, parent, params }) => {
  const { registration } = await loadQuery(
    {
      registration: [
        {
          id: `${
            reverseMap(ID_PREFIXES_TO_TYPENAMES).Registration
          }:${params.pseudoID.toLowerCase()}`,
        },
        Selector('Registration')({
          __typename: true,
          '...on Error': {
            message: true,
          },
          '...on QueryRegistrationSuccess': {
            data: {
              id: true,
              beneficiary: true,
              beneficiaryUser: {
                uid: true,
                firstName: true,
                lastName: true,
              },
              authorIsBeneficiary: true,
              paid: true,
              author: {
                uid: true,
                firstName: true,
                lastName: true,
              },
              ticket: {
                name: true,
                group: {
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
    { fetch, parent }
  );

  if (registration.__typename === 'Error') throw error(400, registration.message);

  return { registration: registration.data };
};
