import { graphql } from '$houdini';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  const { major } = await graphql(`
    query PageAppDocumentsMajorPage($major: String!) {
      major(uid: $major) {
        name
        shortName
        uid
      }
    }
  `)
    .fetch({ event, variables: { major: event.params.major } })
    .then((d) => d.data ?? { major: null });

  if (!major) error(404, { message: 'Filière non trouvée' });
  return { major };
};
