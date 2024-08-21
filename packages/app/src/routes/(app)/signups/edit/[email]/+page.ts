import { graphql } from '$houdini';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  const result = await graphql(`
    query PageSignupsEdit($email: String!) {
      userCandidateByEmail(email: $email) {
        firstName
        lastName
        fullName
        email
        birthday
        graduationYear
        majorId
        cededImageRightsToTVn7
      }
      schoolGroups {
        names
        majors {
          id
          name
          schools {
            name
          }
        }
      }
    }
  `)
    .fetch({ event, variables: event.params })
    .then((d) => d.data ?? { userCandidateByEmail: null, schoolGroups: { names: [], majors: [] } });

  if (!result.userCandidateByEmail) error(404, { message: 'Candidat non trouvé' });
  return result;
};
