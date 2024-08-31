import { graphql } from '$houdini';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  // return loadQuery(
  //   {
  //     group: [
  //       { uid: params.uid },
  //       {
  //         id: true,
  //         uid: true,
  //         studentAssociation: {
  //           uid: true,
  //           name: true,
  //         },
  //         members: {
  //           memberId: true,
  //           createdAt: true,
  //           member: {
  //             uid: true,
  //             firstName: true,
  //             lastName: true,
  //             pictureFile: true,
  //             fullName: true,
  //             yearTier: true,
  //             contributesTo: {
  //               uid: true,
  //             },
  //           },
  //           title: true,
  //           president: true,
  //           treasurer: true,
  //           secretary: true,
  //           vicePresident: true,
  //           canEditMembers: true,
  //           canEditArticles: true,
  //           canScanEvents: true,
  //           isDeveloper: true,
  //         },
  //       },
  //     ],
  //   },
  //   { fetch, token },
  // );

  const result = await graphql(`
    query GroupEditMembers($uid: String!) {
      group(uid: $uid) {
        id
        uid
        studentAssociation {
          uid
          name
        }
        members {
          memberId
          createdAt
          member {
            uid
            firstName
            lastName
            pictureFile
            fullName
            yearTier
            contributesTo {
              uid
            }
          }
          title
          president
          treasurer
          secretary
          vicePresident
          canEditMembers
          canEditArticles
          canScanEvents
          isDeveloper
        }
      }
    }
  `)
    .fetch({ event, variables: { uid: event.params.uid } })
    .then((d) => d.data);

  if (!result?.group) error(404, { message: 'Groupe introuvable' });
  return result;
};
