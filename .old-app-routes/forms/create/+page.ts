import { graphql } from '$houdini';
import { redirectToLogin } from '$lib/session.js';

export async function load(event) {
  const { me } = await graphql(`
    query PageAppFormsCreate {
      me {
        boardMemberships {
          group {
            uid
            id
            name
            pictureFile
            pictureFileDark
          }
        }
      }
    }
  `)
    .fetch({ event })
    .then((d) => d.data ?? { me: null });

  if (!me) redirectToLogin(event.url.pathname, event.url.searchParams);
  return { me };
}
