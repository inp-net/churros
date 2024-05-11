import { redirectToLogin } from '$lib/session';
import { GroupType, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { me } = await parent();
  if (!me) {
    redirectToLogin('/groups/create');
    return;
  }

  const data = await loadQuery(
    {
      schoolGroups: { majors: { id: true, name: true }, names: true },
    },
    { fetch, parent },
  );

  const group = {
    id: '',
    uid: '',
    type: GroupType.Club,
    parentId: undefined,
    groupId: '',
    studentAssociationId: me.contributesTo[0]?.id,
    name: '',
    color: '#aaaaaa',
    address: '',
    description: '',
    email: `contact@bde.${me.major?.schools[0].name.toLowerCase()}.fr`,
    longDescription: '',
    website: '',
    links: [],
    pictureFile: '',
    pictureFileDark: '',
    selfJoinable: false,
    related: [],
  };

  return { ...data, lydiaAccountsOfGroup: [], group };
};
