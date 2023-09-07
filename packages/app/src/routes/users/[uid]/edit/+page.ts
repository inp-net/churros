import { loadQuery, Selector } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const _userQuery = Selector('User')({
  id: true,
  uid: true,
  email: true,
  otherEmails: true,
  firstName: true,
  lastName: true,
  nickname: true,
  fullName: true,
  description: true,
  pictureFile: true,
  address: true,
  apprentice: true,
  graduationYear: true,
  phone: true,
  birthday: true,
  cededImageRightsToTVn7: true,
  links: { name: true, value: true },
  godparent: {
    uid: true,
    firstName: true,
    lastName: true,
    pictureFile: true,
    fullName: true,
  },
  godchildren: {
    uid: true,
    firstName: true,
    lastName: true,
    pictureFile: true,
    fullName: true,
  },
  outgoingGodparentRequests: {
    id: true,
    godparent: {
      uid: true,
      firstName: true,
      lastName: true,
      pictureFile: true,
      fullName: true,
    },
    createdAt: true,
  },
  incomingGodparentRequests: {
    id: true,
    godchild: {
      uid: true,
      firstName: true,
      lastName: true,
      pictureFile: true,
      fullName: true,
    },
    createdAt: true,
  },
  contributesTo: {
    name: true,
    id: true,
  },
  contributesWith: {
    name: true,
    id: true,
  },
  familyTree: {
    users: { uid: true },
  },
  major: {
    id: true,
    name: true,
    schools: {
      name: true,
      id: true,
      studentAssociations: {
        name: true,
        id: true,
      },
    },
  },
  notificationSettings: {
    id: true,
    type: true,
    allow: true,
    group: {
      id: true,
      uid: true,
      name: true,
      pictureFile: true,
    },
  },
});

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  if (params.uid !== me?.uid && !me?.canEditUsers) throw redirect(307, '..');

  const result = await loadQuery(
    {
      user: [params, _userQuery],
      // If the user is an admin, we also load the permissions
      __alias: {
        userPermissions: me.admin
          ? { user: [params, { admin: true, canEditUsers: true, canEditGroups: true }] }
          : {},
      },
      schoolGroups: { names: true, majors: { id: true, name: true } },
      contributionOptions: {
        name: true,
        id: true,
      },
      me: {
        uid: true,
        admin: true,
        canEditGroups: true,
        canEditUsers: true,
        credentials: {
          id: true,
          type: true,
          userAgent: true,
          createdAt: true,
          active: true,
        },
        cededImageRightsToTVn7: true,
        groups: {
          group: {
            uid: true,
            name: true,
            pictureFile: true,
          },
          title: true,
        },
      },
    },
    { fetch, parent }
  );
  return {
    ...result,
    user: {
      ...result.user,
      // eslint-disable-next-line unicorn/no-null
      birthday: result.user.birthday ?? null,
    },
  };
};
