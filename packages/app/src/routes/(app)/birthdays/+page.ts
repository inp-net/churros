import { graphql } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  return await graphql(`
    query PageBirthdays {
      birthdays(width: 4) {
        birthday
        fullName
        uid
        pictureFile
        major {
          shortName
        }
      }
    }
  `)
    .fetch({ event })
    .then((d) => d.data ?? { birthdays: [] });
};
