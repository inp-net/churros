import { graphql } from '$houdini';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async (event) => {
  const { group } = await graphql(`
    query LayoutAppGroupsGroupEdit($uid: String!) {
      group(uid: $uid) {
        uid
        name
        canListPages
        canEditDetails
      }
    }
  `)
    .fetch({ event, variables: { uid: event.params.uid } })
    .then((d) => d.data ?? { group: null });

  if (!group) error(404, { message: 'Groupe non trouvé' });
  return { group };
};
