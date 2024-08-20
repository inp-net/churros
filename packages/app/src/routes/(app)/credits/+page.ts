import { graphql } from '$houdini';
import { fail } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  const { codeContributors } = await graphql(`
    query PageCredits {
      codeContributors {
        ... on ErrorInterface {
          message
        }
        ... on QueryCodeContributorsSuccess {
          data {
            uid
            id
            fullName
            pictureFile
          }
        }
      }
    }
  `)
    .fetch({ event })
    .then((d) => d.data ?? { codeContributors: { data: [] } });

  if ('message' in codeContributors) throw fail(500);

  return { codeContributors: codeContributors.data };
};
