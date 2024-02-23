import { redirectToLogin } from '$lib/session';
import { Selector, ZeusError, loadQuery, makeMutation } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
  let claimedCode = false;
  let claimCodeError = '';
  if (url.searchParams.has('claimCode')) {
    const { me } = await parent().catch(() => ({ me: undefined }));
    if (!me) throw redirectToLogin(url.pathname, { claimCode: url.searchParams.get('claimCode')! });
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

  try {
    const data = await loadQuery(
      {
        ticketsOfEvent: [
          {
            eventUid: params.uid,
            groupUid: params.group,
          },
          {
            uid: true,
            id: true,
            name: true,
            descriptionHtml: true,
            price: true,
            capacity: true,
            placesLeft: true,
            opensAt: true,
            closesAt: true,
            group: {
              capacity: true,
              name: true,
            },
            links: {
              name: true,
              value: true,
              computedValue: true,
            },
            registrations: {
              id: true,
              opposed: true,
              cancelled: true,
              beneficiary: true,
              beneficiaryUser: {
                uid: true,
                firstName: true,
                fullName: true,
                lastName: true,
              },
              authorIsBeneficiary: true,
              author: {
                uid: true,
              },
              paid: true,
              ticket: {
                name: true,
              },
            },
            openToAlumni: true,
            openToExternal: true,
            openToGroups: {
              uid: true,
              name: true,
              pictureFile: true,
              pictureFileDark: true,
            },
            openToContributors: true,
            openToSchools: {
              uid: true,
              name: true,
              color: true,
              id: true,
            },
            openToPromotions: true,
            openToMajors: {
              name: true,
              shortName: true,
              id: true,
            },
            onlyManagersCanProvide: true,
            event: { id: true },
          },
        ],
        event: [
          { groupUid: params.group, uid: params.uid },
          Selector('Event')({
            startsAt: true,
            endsAt: true,
            uid: true,
            location: true,
            id: true,
            pictureFile: true,
            placesLeft: true,
            capacity: true,
            frequency: true,
            reactionCounts: true,
            myReactions: true,
            visibility: true,
            articles: {
              id: true,
              uid: true,
              bodyHtml: true,
              bodyPreview: true,
              publishedAt: true,
              title: true,
              group: {
                uid: true,
                name: true,
                pictureFile: true,
                pictureFileDark: true,
              },
              author: {
                uid: true,
                fullName: true,
                firstName: true,
                lastName: true,
                pictureFile: true,
              },
              createdAt: true,
              myReactions: true,
              reactionCounts: true,
            },
            author: {
              uid: true,
              firstName: true,
              fullName: true,
              lastName: true,
              pictureFile: true,
            },
            descriptionHtml: true,
            description: true,
            title: true,
            links: {
              name: true,
              value: true,
              computedValue: true,
            },
            group: {
              uid: true,
              name: true,
              pictureFile: true,
              pictureFileDark: true,
              email: true,
            },
            coOrganizers: {
              uid: true,
              name: true,
              email: true,
              pictureFile: true,
              pictureFileDark: true,
            },
            contactMail: true,
            managers: {
              user: {
                uid: true,
              },
              canEdit: true,
              canEditPermissions: true,
              canVerifyRegistrations: true,
            },
          }),
        ],
      },
      { fetch, parent },
    );
    return {
      ...data,
      claimedCode,
      claimCodeError,
    };
  } catch (error) {
    if (error instanceof ZeusError) {
      // console.error(error);
      throw redirectToLogin(url.pathname);
    }
  }
};
