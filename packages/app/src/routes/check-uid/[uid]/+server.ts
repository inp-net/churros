import { graphql, UIDIsAvailableStore } from '$houdini';
import { json } from '@sveltejs/kit';

graphql(`
  query UIDIsAvailable($uid: UID!) @blocking {
    uidIsAvailable(uid: $uid)
  }
`);

// Get list of all first route id segments to add them as reserved usernames
// Users would still be able to register via the API directly, but their profile page would be inaccessible (using this webapp at least), so it'd be kind of a dumb thing to do
// We _may_ want to inject that code into the API too to fix this if we ever get an undesirable situation out of it

// @generated by src/scripts/generate-reserved-usernames-from-routes.ts
const additionalReservedUsernames = new Set([
  '_component',
  'check-uid',
  'developers',
  'markdown',
  'signup',
  'announcements',
  'backrooms',
  'bar-weeks',
  'birthdays',
  'boards',
  'bookings',
  'changelog',
  'claim-code',
  'credits',
  'documents',
  'events',
  'forms',
  'frappe',
  'groups',
  'help',
  'login',
  'logout',
  'logs',
  'more',
  'notifications',
  'posts',
  'quick-signups',
  'register',
  'reports',
  'schools',
  'search',
  'services',
  'set-password',
  'signups',
  'student-associations',
  'users',
  'validate-email',
  'welcome',
  'authorize',
  'connect',
  'health',
  'identity',
  'kiosk',
  'icons',
  'logos',
  'reactions',
  'schools',
  'student-associations',
  'vendor',
]);
// end @generated

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
