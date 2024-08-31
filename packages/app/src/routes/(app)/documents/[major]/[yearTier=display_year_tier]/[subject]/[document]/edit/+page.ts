import { graphql } from '$houdini';
import { parseDisplayYearTierAndForApprentices } from '$lib/dates';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  const { yearTier, forApprentices } = parseDisplayYearTierAndForApprentices(event.params.yearTier);
  const { subject, major } = await graphql(`
    query PageDocumentEdit_SubjectAndMajor(
      $major: String!
      $yearTier: Int!
      $forApprentices: Boolean!
      $subject: String!
    ) {
      major(uid: $major) {
        name
        shortName
        uid
      }
      subject(forApprentices: $forApprentices, slug: $subject, yearTier: $yearTier) {
        name
        shortName
        uid
        id
        forApprentices
        yearTier
        emoji
      }
    }
  `)
    .fetch({
      event,
      variables: {
        major: event.params.major,
        yearTier,
        forApprentices,
        subject: event.params.subject,
      },
    })
    .then((d) => d.data ?? { major: null, subject: null });

  if (!major || !subject) error(404, { message: 'Filière ou matière non trouvée' });

  const { document } = await graphql(`
    query PageDocumentEdit_Document($subject: ID!, $document: String!) {
      document(subject: $subject, slug: $document) {
        title
        id
        type
        schoolYear
        description
        solutionPaths
        paperPaths
        createdAt
        updatedAt
        subject {
          name
          emoji
          shortName
          forApprentices
          yearTier
          uid
          id
          minors {
            uid
            name
            shortName
          }
          majors {
            uid
            name
            shortName
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
    major,
    subject,
    document,
  };
};
