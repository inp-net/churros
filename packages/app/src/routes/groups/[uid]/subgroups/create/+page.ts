import { GroupType, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
  const {
    group: { id: parentId, studentAssociation, email, website, ...parentGroup },
  } = await loadQuery(
    {
      group: [
        { uid: params.uid },
        {
          id: true,
          name: true,
          uid: true,
          pictureFile: true,
          pictureFileDark: true,
          website: true,
          email: true,
          children: {
            name: true,
            studentAssociation: { school: { name: true } },
          },
          studentAssociation: {
            id: true,
            uid: true,
            name: true,
            school: { uid: true, id: true, name: true, color: true },
          },
        },
      ],
    },
    { fetch, parent },
  );
  return {
    ...(await loadQuery(
      {
        schools: { id: true, name: true },
        schoolGroups: { majors: { id: true, name: true }, names: true },
      },
      { fetch, parent },
    )),
    lydiaAccountsOfGroup: [],
    group: {
      id: '',
      uid: '',
      type: GroupType.Group,
      parentId,
      parent: { ...parentGroup, id: parentId },
      groupId: '',
      studentAssociationId: studentAssociation?.id,
      studentAssociation,
      name: '',
      color: '#aaaaaa',
      address: '',
      description: '',
      email,
      longDescription: '',
      website,
      links: [],
      pictureFile: '',
      pictureFileDark: '',
      selfJoinable: false,
      related: [],
    },
  };
};
