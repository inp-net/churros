import { graphql } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  // return loadQuery(
  //   {
  //     ...(me
  //       ? {
  //           studentAssociations: [
  //             {},
  //             { uid: true, name: true, description: true, id: true, school: { uid: true } },
  //           ],
  //         }
  //       : {}),
  //     groups: [
  //       {},
  //       {
  //         uid: true,
  //         name: true,
  //         groupId: true,
  //         parentId: true,
  //         pictureFile: true,
  //         pictureFileDark: true,
  //         description: true,
  //         type: true,
  //         studentAssociation: {
  //           uid: true,
  //           contributionOptions: {
  //             offeredIn: {
  //               uid: true,
  //             },
  //           },
  //           school: {
  //             name: true,
  //           },
  //         },
  //       },
  //     ],
  //   },
  //   { fetch, parent },
  // );
  return await graphql(`
    query PageGroups {
      groups {
        id
        uid
        name
        groupId
        parentId
        pictureFile
        pictureFileDark
        description
        type
        studentAssociation {
          uid
          contributionOptions {
            offeredIn {
              uid
            }
          }
          school {
            name
          }
        }
      }
    }
  `)
    .fetch({ event })
    .then((d) => d.data ?? { groups: [] });
};
