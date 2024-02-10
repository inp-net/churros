import { redirectToLogin } from '$lib/session';
import { Selector, loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  console.log(`loading data for event edit`)
  const data = await loadQuery(
    {
      lydiaAccounts: {
        id: true,
        name: true,
        group: {
          pictureFile: true,
          pictureFileDark: true,
          name: true,
        },
      },
      groups: [{}, Selector('Group')({ uid: true, id: true, name: true, pictureFile: true })],
      event: [
        {
          groupUid: params.group,
          uid: params.uid,
        },
        Selector('Event')({
          id: true,
          startsAt: true,
          endsAt: true,
          pictureFile: true,
          description: true,
          frequency: true,
          recurringUntil: true,
          group: {
            id: true,
            uid: true,
            name: true,
            pictureFile: true,
            pictureFileDark: true,
            studentAssociation: { school: { name: true } },
            children: {
              name: true,
              studentAssociation: { school: { name: true } },
            },
          },
          coOrganizers: {
            id: true,
            uid: true,
            name: true,
            pictureFile: true,
            pictureFileDark: true,
            studentAssociation: { school: { name: true } },
            children: {
              name: true,
              studentAssociation: { school: { name: true } },
            },
          },
          tickets: {
            id: true,
            uid: true,
            name: true,
            description: true,
            price: true,
            capacity: true,
            opensAt: true,
            closesAt: true,
            order: true,
            autojoinGroups: {
              id: true,
              uid: true,
              name: true,
              pictureFile: true,
              pictureFileDark: true,
            },
            links: {
              value: true,
              name: true,
            },
            allowedPaymentMethods: true,
            openToPromotions: true,
            openToExternal: true,
            openToAlumni: true,
            openToApprentices: true,
            openToSchools: {
              uid: true,
              name: true,
              id: true,
            },
            openToMajors: {
              shortName: true,
              name: true,
              id: true,
              uid: true,
            },
            openToGroups: {
              id: true,
              uid: true,
              name: true,
              pictureFile: true,
              pictureFileDark: true,
            },
            group: {
              uid: true,
            },
            openToContributors: true,
            godsonLimit: true,
            onlyManagersCanProvide: true,
          },
          ticketGroups: {
            id: true,
            uid: true,
            name: true,
            capacity: true,
          },
          contactMail: true,
          beneficiary: {
            id: true,
            name: true,
            group: {
              name: true,
              pictureFile: true,
              pictureFileDark: true,
            },
          },
          links: {
            value: true,
            name: true,
          },
          location: true,
          uid: true,
          title: true,
          visibility: true,
          managers: {
            user: {
              uid: true,
              firstName: true,
              lastName: true,
              fullName: true,
              pictureFile: true,
            },
            canEdit: true,
            canEditPermissions: true,
            canVerifyRegistrations: true,
          },
          bannedUsers: {
            uid: true,
            firstName: true,
            lastName: true,
            fullName: true,
            pictureFile: true,
          },
        }),
      ],
    },
    { fetch, parent },
  );

  const canEdit =
    me.canEditGroups ||
    Boolean(
      me.groups.some(
        ({ group, canEditArticles }) => canEditArticles && group.id === data.event.group.id,
      ),
    ) ||
    Boolean(data.event.managers.some(({ user, canEdit }) => canEdit && user.uid === me.uid));

  if (!canEdit) throw redirect(307, '..');

  return data;
};
