import { Selector, loadQuery } from '$lib/zeus';
import { ID_PREFIXES_TO_TYPENAMES } from '@centraverse/api/src/builder';
import type { PageServerLoad } from './$types';

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

  if (registration.__typename === 'Error') {
    return {
      status: 404,
      error: new Error(registration.message),
    };
  }

  return registration.data;
};
