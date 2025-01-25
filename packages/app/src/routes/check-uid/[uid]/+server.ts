import { graphql, UIDIsAvailableStore } from '$houdini';
import { PAGES, SERVERS } from '$lib/ROUTES.js';
import { json } from '@sveltejs/kit';

graphql(`
  query UIDIsAvailable($uid: UID!) @blocking {
    uidIsAvailable(uid: $uid)
  }
`);

// Get list of all first route id segments to add them as reserved usernames
// Users would still be able to register via the API directly, but their profile page would be inaccessible (using this webapp at least), so it'd be kind of a dumb thing to do
// We _may_ want to inject that code into the API too to fix this if we ever get an undesirable situation out of it

const additionalReservedUsernames = new Set(
  [
    // PAGES: it's the path directly
    ...Object.keys(PAGES),
    // SERVERS: get only GET endpoints, extract the path
    ...Object.keys(SERVERS)
      .filter((endpoint) => endpoint.startsWith('GET '))
      .map((endpoint) => endpoint.replace(/^GET /, '')),
    // ACTIONS: get the action's path (it's written as `actionName /path/to/action`)
    // ...Object.keys(ACTIONS).map((action) => action.split(' ', 2)[1]),
  ]
    // Get the first segment of the path (all paths start with '/' so it's [1])
    .map((path) => path.split('/')[1])
    // Filter out dynamic segments
    .filter((fragment) => !fragment.includes('[')),
);

export const _RESERVED_USERNAMES = additionalReservedUsernames;

export async function GET(event) {
  if (!/^[\w-]{3,255}$/.test(event.params.uid)) {
    return json({
      available: false,
      errors: ['Format invalide'],
    });
  }

  if (additionalReservedUsernames.has(event.params.uid)) {
    return json({
      available: false,
      errors: [],
    });
  }

  const query = new UIDIsAvailableStore();
  const { data, errors } = await query.fetch({
    event,
    variables: {
      uid: event.params.uid,
    },
  });

  if (errors || !data) {
    return json({
      available: true,
      errors,
    });
  }

  return json({
    available: data.uidIsAvailable,
    errors: [],
  });
}
