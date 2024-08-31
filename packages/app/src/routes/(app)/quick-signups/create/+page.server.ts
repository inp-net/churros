import { graphql } from '$houdini';

export async function load(event) {
  return await graphql(`
    query PageQuickSignupCreate {
      me: assertMe {
        major {
          schools {
            id
            uid
            name
            pictureFile
          }
        }
      }
    }
  `)
    .fetch({ event })
    .then((d) => d.data ?? { me: { major: { schools: [] } } });
}
