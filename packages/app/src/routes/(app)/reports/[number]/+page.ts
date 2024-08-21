import { graphql } from '$houdini';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  const { issue } = await graphql(`
    query PageReportDetails($number: Int!) {
      issue(number: $number) {
        number
        body
        title
        state
        importance
        difficulty
        url
        bodyHtml
        comments {
          authorName
          bodyHtml
          body
          addedAt
          authorAvatarUrl
          authorGitlabUrl
        }
      }
    }
  `)
    .fetch({ event })
    .then((d) => d.data ?? { issue: null });

  if (!issue) error(404, { message: 'Rapport non trouvé' });
  return { issue };
};
