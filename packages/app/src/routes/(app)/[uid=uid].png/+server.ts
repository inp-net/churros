import { graphql } from '$houdini';
import { error, redirect } from '@sveltejs/kit';

export async function GET(event) {
  const { data } = await graphql(`
    query PageUIDPicture($uid: UID!) {
      profile(uid: $uid) {
        ... on Pictured {
          pictureURL
        }
      }
    }
  `).fetch({ variables: event.params, event });

  if (data?.profile && 'pictureURL' in data.profile && data.profile.pictureURL)
    redirect(302, data.profile.pictureURL);

  error(404, { message: 'Profil introuvable' });
}
