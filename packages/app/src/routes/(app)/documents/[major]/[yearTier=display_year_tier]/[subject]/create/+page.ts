import { graphql } from '$houdini';
import { parseDisplayYearTierAndForApprentices } from '$lib/dates';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  const { yearTier, forApprentices } = parseDisplayYearTierAndForApprentices(event.params.yearTier);
  const { major, subject } = await graphql(`
    query PageDocumentsMajorSubject(
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

  if (!major || !subject) error(404, { message: 'Filière ou matière introuvable' });
  return { major, subject };
};
