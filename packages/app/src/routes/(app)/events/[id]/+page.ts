import { graphql, load_PageEvent } from '$houdini';
import { ZeusError, makeMutation } from '$lib/zeus';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

graphql(`
  query PageEvent($id: LocalID!) {
    event(id: $id) {
      startsAt
      endsAt
      uid
      localID
      location
      id
      pictureFile
      placesLeft
      capacity
      frequency
      reactionCounts
      myReactions
      visibility
      articles {
        id
        uid
        localID
        bodyHtml
        bodyPreview
        publishedAt
        title
        group {
          uid
          name
          pictureFile
          pictureFileDark
        }
        createdAt
        myReactions
        reactionCounts
      }
      descriptionHtml
      description
      title
      links {
        name
        value
        computedValue
      }
      group {
        uid
        name
        pictureFile
        pictureFileDark
        email
      }
      coOrganizers {
        uid
        name
        email
        pictureFile
        pictureFileDark
      }
      contactMail
      managers {
        user {
          uid
        }
        canEdit
        canEditPermissions
        canVerifyRegistrations
      }
      forms {
        localId
        title
      }
      tickets {
        uid
        id
        name
        descriptionHtml
        price
        capacity
        placesLeft
        opensAt
        closesAt
        group {
          capacity
          name
        }
        links {
          name
          value
          computedValue
        }
        registrations {
          id
          opposed
          cancelled
          beneficiary
          beneficiaryUser {
            uid
            firstName
            fullName
            lastName
          }
          authorIsBeneficiary
          author {
            uid
          }
          paid
          ticket {
            name
          }
        }
        openToAlumni
        openToExternal
        openToGroups {
          uid
          name
          pictureFile
          pictureFileDark
        }
        openToContributors
        openToSchools {
          uid
          name
          color
          id
        }
        openToPromotions
        openToMajors {
          name
          shortName
          id
        }
        onlyManagersCanProvide
        event {
          id
        }
      }
    }
  }
`);

export const load: PageLoad = async (event) => {
  let claimedCode = false;
  const { url, params, fetch, parent } = event;
  let claimCodeError = '';
  if (url.searchParams.has('claimCode')) {
    try {
      ({ claimPromotionCode: claimedCode } = await makeMutation(
        {
          claimPromotionCode: [{ code: url.searchParams.get('claimCode')! }, true],
        },
        { fetch, parent },
      ));
    } catch (error: unknown) {
      claimCodeError =
        error instanceof ZeusError
          ? error.errors.map((e) => e.message).join(', ')
          : error?.toString() ?? 'Une erreur inconnue est survenue';
    }
  }

  const { data, errors } = await load_PageEvent({ event, variables: params }).then((stores) =>
    get(stores.PageEvent),
  );

  if (!data) error(500, { message: 'Erreur: ' + errors?.map((e) => e.message).join(', ') });
  if (!data.event) error(404, { message: 'Événement indisponible' });

  return {
    ...data,
    claimedCode,
    claimCodeError,
  };
};
