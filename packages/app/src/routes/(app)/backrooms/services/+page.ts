import { graphql } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  return await graphql(`
    query PageBackroomServices {
      services(mine: false) {
        id
        name
        url
        description
        logo
        logoSourceType
        group: owner {
          ... on Pictured {
            pictureFile
            pictureFileDark
          }
        }
      }
    }
  `)
    .fetch({ event })
    .then(
      (d) =>
        d.data ?? {
          services: [],
        },
    );
};
