import { graphql } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  return await graphql(`
    query BarWeeksPage {
      barWeeks {
        id
        uid: slug
        startsAt
        endsAt
        descriptionHtml
        description
        groups {
          id
          uid
          pictureFile
          pictureFileDark
          name
        }
      }
    }
  `)
    .fetch({ event })
    .then((d) => d.data ?? { barWeeks: [] });
};
