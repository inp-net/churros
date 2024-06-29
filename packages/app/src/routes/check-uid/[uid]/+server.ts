import { graphql, UIDIsAvailableStore } from '$houdini';
import { json } from '@sveltejs/kit';
import { readdirSync } from 'node:fs';

graphql(`
  query UIDIsAvailable($uid: UID!) {
    uidIsAvailable(uid: $uid)
  }
`);
// Get list of all first route id segments to add them as reserved usernames

const additionalReservedUsernames = new Set([
  ...readdirSync('src/routes'),
  ...readdirSync('src/routes/(app)'),
  ...readdirSync('src/routes/(external)'),
]);

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

  if (errors) {
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
