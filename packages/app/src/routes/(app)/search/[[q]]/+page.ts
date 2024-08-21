import { graphql } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  const { q } = event.params;

  if (!q) return { searchUsers: [], searchGroups: [], searchEvents: [], searchArticles: [] };

  const similarityCutoff = event.url.searchParams.get('sim')
    ? Number.parseFloat(event.url.searchParams.get('sim')!)
    : undefined;

  return await graphql(`
    query PageSearch($q: String!, $similarityCutoff: Float) {
      searchUsers(q: $q, similarityCutoff: $similarityCutoff) {
        similarity
        rank
        user {
          uid
          firstName
          lastName
          pictureFile
          fullName
        }
      }
      searchGroups(q: $q, similarityCutoff: $similarityCutoff) {
        similarity
        rank
        group {
          uid
          name
          pictureFile
          pictureFileDark
        }
      }
    }
  `)
    .fetch({ event, variables: { similarityCutoff, q } })
    .then(
      (d) => d.data ?? { searchUsers: [], searchGroups: [], searchEvents: [], searchArticles: [] },
    );
};
