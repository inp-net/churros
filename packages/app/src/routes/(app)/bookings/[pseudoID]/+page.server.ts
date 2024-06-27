import { ensureIdPrefix, hasIdPrefix, removeIdPrefix } from '$lib/typenames';
import { Selector, loadQuery, makeMutation } from '$lib/zeus';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, parent, params, url }) => {
  if (hasIdPrefix('Registration', params.pseudoID)) {
    throw redirect(
      301,
      url.pathname.replace(
        params.pseudoID,
        removeIdPrefix('Registration', params.pseudoID).toUpperCase(),
      ),
    );
  }

  const id = ensureIdPrefix('Registration', params.pseudoID.toLowerCase());

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
              verified: true,
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
                  value: true,
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
