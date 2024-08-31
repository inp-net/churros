import { graphql } from '$houdini';

export async function load(event) {
  return await graphql(`
    query PageManageSignups {
      userCandidates {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            firstName
            lastName
            fullName
            email
            major {
              name
              shortName
            }
            graduationYear
          }
        }
      }
    }
  `)
    .fetch({ event })
    .then((d) => d.data ?? { userCandidates: { pageInfo: { hasNextPage: false }, edges: [] } });
}
