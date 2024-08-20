import { graphql } from '$houdini';
import { parseDisplayYearTierAndForApprentices } from '$lib/dates';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  const { yearTier, forApprentices } = parseDisplayYearTierAndForApprentices(event.params.yearTier);
  // return loadQuery(
  //   {
  //     major: [{ uid: params.major }, { name: true, shortName: true, uid: true }],
  //     subject: [
  //       { slug: params.subject, yearTier, forApprentices },
  //       { name: true, shortName: true, uid: true, id: true, emoji: true },
  //     ],
  //     document: [
  //       {
  //         subject: params.subject,
  //         slug: params.document,
  //       },
  //       {
  //         title: true,
  //         id: true,
  //         type: true,
  //         schoolYear: true,
  //         descriptionHtml: true,
  //         solutionPaths: true,
  //         paperPaths: true,
  //         createdAt: true,
  //         updatedAt: true,
  //         subject: {
  //           name: true,
  //           uid: true,
  //           minors: {
  //             uid: true,
  //           },
  //           majors: {
  //             uid: true,
  //           },
  //         },
  //         uploader: {
  //           uid: true,
  //           pictureFile: true,
  //           fullName: true,
  //         },
  //         comments: [
  //           {
  //             first: 100,
  //           },
  //           {
  //             edges: {
  //               node: {
  //                 id: true,
  //                 author: { uid: true, fullName: true, pictureFile: true },
  //                 bodyHtml: true,
  //                 body: true,
  //                 inReplyToId: true,
  //                 createdAt: true,
  //                 updatedAt: true,
  //               },
  //             },
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   { fetch, parent },
  // );
  const { major, subject } = await graphql(`
    query PageDocumentsMajorSubjectDocument_MajorAndSubject(
      $major: String!
      $subject: String!
      $yearTier: Int!
      $forApprentices: Boolean!
    ) {
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
    .then((d) => d.data ?? { major: null, subject: null });

  if (!major || !subject) error(404, { message: 'Filière ou matière non trouvée' });

  const { document } = await graphql(`
    query PageDocumentsMajorSubjectDocument_Document($subject: ID!, $document: String!) {
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
        comments {
          edges {
            node {
              id
              author {
                uid
                fullName
                pictureFile
              }
              bodyHtml
              body
              inReplyToId
              createdAt
              updatedAt
            }
          }
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
