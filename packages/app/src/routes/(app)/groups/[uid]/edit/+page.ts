import { graphql } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  return await graphql(`
    query PageGroupsEdit($uid: String!) {
      group(uid: $uid) {
        uid
        parentId
        groupId
        type
        name
        color
        address
        description
        email
        pictureFile
        longDescription
        selfJoinable
        links {
          name
          value
        }
        selfJoinable
        lydiaAccounts {
          id
          name
        }
      }
    }
  `)
    .fetch({ event, variables: { uid: event.params.uid } })
    .then((d) => d.data ?? { group: null });
};
