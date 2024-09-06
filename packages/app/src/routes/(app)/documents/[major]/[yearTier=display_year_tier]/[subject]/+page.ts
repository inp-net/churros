import { graphql, load_PageSchoolSubject } from '$houdini';
import { parseDisplayYearTierAndForApprentices } from '$lib/dates';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

graphql(`
  query PageSchoolSubject(
    $major: String!
    $subject: String!
    $yearTier: Int!
    $forApprentices: Boolean!
  ) @blocking {
    major(uid: $major) {
      name
      shortName
      uid
    }
    subject(slug: $subject, yearTier: $yearTier, forApprentices: $forApprentices) {
      name
      emoji
      shortName
      uid
      id
      links {
        name
        computedValue
      }
      documents {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            uid
            schoolYear
            solutionPaths
            paperPaths
            type
            createdAt
          }
        }
      }
    }
  }
`);

export const load: PageLoad = async (event) => {
  const { yearTier, forApprentices } = parseDisplayYearTierAndForApprentices(event.params.yearTier);
  return load_PageSchoolSubject({
    event,
    variables: {
      yearTier,
      forApprentices,
      major: event.params.major,
      subject: event.params.subject,
    },
  }).then((stores) => get(stores.PageSchoolSubject).data!);
};
