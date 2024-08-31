import { graphql } from '$houdini';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  const yearTier = Number.parseInt(event.params.yearTier.replace(/a(-fis(e|a))?$/, ''), 10);
  const forApprentices = event.params.yearTier.endsWith('a-fisa');
  const { major } = await graphql(`
    query PageDocumentsMajorYearTier($major: String!, $yearTier: Int!, $forApprentices: Boolean!) {
      major(uid: $major) {
        name
        shortName
        uid
        subjects(forApprentices: $forApprentices, yearTier: $yearTier) {
          id
          name
          emoji
          shortName
          semester
          uid
          nextExamAt
          yearTier
          unit {
            shortName
            name
          }
          minors {
            name
            uid
            id
          }
          documentsCount
        }
      }
    }
  `)
    .fetch({ event, variables: { major: event.params.major, yearTier, forApprentices } })
    .then((d) => d.data ?? { major: null });

  if (!major) error(404, { message: 'Filière non trouvée' });

  return {
    major,
    subjectsOfMajor: major.subjects,
  };
};
