import { graphql } from '$houdini';
import { error } from '@sveltejs/kit';

export async function load(event) {
  const { service } = await graphql(`
    query PageServicesEdit($id: LocalID!) @blocking {
      service(id: $id) {
        id
        localID
        name
        url
        description
        logo
        logoSourceType
        importance
        group {
          id
          uid
          name
          pictureFile
          pictureFileDark
        }
        studentAssociation {
          id
          uid
          name
        }
        school {
          id
          uid
          name
        }
      }
    }
  `)
    .fetch({ event, variables: event.params })
    .then((d) => d.data ?? { service: null });

  if (!service) error(404, { message: 'Service non trouvé' });
  return { service };
}
