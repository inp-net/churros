import { GroupType, loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { me } = await parent();
  if (!me?.canEditGroups) throw redirect(307, '..');
  return {
    ...(await loadQuery(
      {
        schools: { id: true, name: true },
        schoolGroups: { majors: { id: true, name: true }, names: true },
      },
      { fetch, parent }
    )),
    lydiaAccountsOfGroup: [],
    group: {
      id: '',
      uid: '',
      type: GroupType.Club,
      parentId: undefined,
      school: me.major.schools[0],
      groupId: '',
      studentAssociationId: undefined,
      name: '',
      color: '#aaaaaa',
      address: '',
      description: '',
      email: 'contact@bde.enseeiht.fr',
      longDescription: '',
      links: [],
      pictureFile: '',
      pictureFileDark: '',
      selfJoinable: false,
      related: [],
    },
  };
};
