import { graphql } from '$houdini';
import { error } from '@sveltejs/kit';

export async function load(event) {
  const { group } = await graphql(`
    query PageGroupMembers($uid: String!) @blocking {
      group(uid: $uid) {
        id
        uid
        name
        canEditDetails
        canEditMembers
        members {
          memberId
          createdAt
          member {
            uid
            firstName
            lastName
            pictureFile
            fullName
            graduationYear
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
    .fetch({ event, variables: event.params })
    .then((d) => d.data ?? { group: null });

  if (!group) error(404, { message: 'Groupe non trouvé' });
  return { group };
}
