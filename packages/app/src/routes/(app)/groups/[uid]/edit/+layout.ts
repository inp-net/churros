import { graphql } from '$houdini';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async (event) =>
  await graphql(`
    query LayoutAppGroupsGroupEdit($uid: String!) {
      group(uid: $uid) {
        uid
        name
        canListPages
      }
    }
  `)
    .fetch({ event, variables: { uid: event.params.uid } })
    .then((d) => d.data ?? { group: null });
