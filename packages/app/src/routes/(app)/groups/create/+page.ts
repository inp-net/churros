import { redirectToLogin } from '$lib/session';
import { GroupType, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

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
    mailingList: '',
    longDescription: '',
    website: '',
    links: [],
    pictureFile: '',
    pictureFileDark: '',
    selfJoinable: false,
    canListPages: true,
    related: [],
  };

  return { ...data, lydiaAccountsOfGroup: [], group, canEditGroup: true };
};
