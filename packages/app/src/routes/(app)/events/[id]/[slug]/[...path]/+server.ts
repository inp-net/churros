import { graphql, load_PageRedirectEventOldURL } from '$houdini';
import { route } from '$lib/ROUTES.js';
import { error, redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

graphql(`
  query PageRedirectEventOldURL($group: UID!, $slug: String!) {
    event(group: $group, slug: $slug) {
      localID
    }
  }
`);

export async function GET(event) {
  const { data } = await load_PageRedirectEventOldURL({
    event,
    variables: {
      group: event.params.id,
      slug: event.params.slug,
    },
  }).then((stores) => get(stores.PageRedirectEventOldURL));
  if (data?.event.localID)
    redirect(301, route('/events/[id]', data.event.localID) + '/' + event.params.path);
  error(404, { message: 'Événement non trouvé' });
}
