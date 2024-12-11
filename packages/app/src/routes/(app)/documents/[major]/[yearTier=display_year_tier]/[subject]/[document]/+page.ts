import { graphql } from '$houdini';
import { parseDisplayYearTierAndForApprentices } from '$lib/dates';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  const { yearTier, forApprentices } = parseDisplayYearTierAndForApprentices(event.params.yearTier);
  const { major, subject, me } = await graphql(`
    query PageDocumentsMajorSubjectDocument_MajorAndSubject(
      $major: String!
      $subject: String!
      $yearTier: Int!
      $forApprentices: Boolean!
    ) @blocking {
      me {
        admin
        uid
      }
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
        forApprentices
        yearTier
        majors {
          uid
          name
          shortName
        }
        minors {
          uid
          name
          shortName
        }
      }
    }
  `)
    .fetch({
      event,
      variables: {
        major: event.params.major,
        subject: event.params.subject,
        yearTier,
        forApprentices,
      },
    })
    .then((d) => d.data ?? { major: null, subject: null, me: null });

  if (!major || !subject) error(404, { message: 'Filière ou matière non trouvée' });

  const { document } = await graphql(`
    query PageDocumentsMajorSubjectDocument_Document($subject: ID!, $document: String!) @blocking {
      document(slug: $document, subject: $subject) {
        title
        id
        type
        schoolYear
        descriptionHtml
        solutionPaths
        paperPaths
        createdAt
        updatedAt
        subject {
          name
          uid
          minors {
            uid
          }
          majors {
            uid
          }
        }
        uploader {
          uid
          pictureFile
          fullName
        }
      }
    }
  `)
    .fetch({
      event,
      variables: {
        subject: subject.id,
        document: event.params.document,
      },
    })
    .then((d) => d.data ?? { document: null });

  if (!document) error(404, { message: 'Document non trouvé' });

  return {
    me,
    major,
    subject,
    document,
  };
};
