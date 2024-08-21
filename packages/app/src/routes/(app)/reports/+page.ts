import { graphql } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  return await graphql(`
    query PageReports {
      issuesByUser {
        number
        body
        title
        state
        importance
        difficulty
        duplicatedFrom
        comments {
          addedAt
        }
      }
    }
  `)
    .fetch({ event })
    .then((d) => d.data ?? { issuesByUser: [] });
};
