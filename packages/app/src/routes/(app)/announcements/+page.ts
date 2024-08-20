import { graphql } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  return await graphql(`
    query PageAnnouncementsList {
      announcements {
        edges {
          node {
            id
            title
            bodyHtml
            by {
              uid
              fullName
              pictureFile
            }
            startsAt
            endsAt
            warning
          }
        }
      }
    }
  `)
    .fetch({ event })
    .then(
      (d) =>
        d.data ?? {
          announcements: { edges: [] },
        },
    );
};
