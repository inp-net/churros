import { graphql } from '$houdini';

export async function load(event) {
  return await graphql(`
    query LayoutGroup($uid: String!) {
      group(uid: $uid) {
        canListPages
        canEditDetails
      }
    }
  `)
    .fetch({ event, variables: { uid: event.params.uid } })
    .then(
      (d) =>
        d.data || {
          group: {
            canEditDetails: false,
            canListPages: false,
          },
        },
    );
}
