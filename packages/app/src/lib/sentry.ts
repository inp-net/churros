import { graphql, type SentryUser$data } from '$houdini';
import * as Sentry from '@sentry/sveltekit';

graphql(`
  fragment SentryUser on User {
    uid
  }
`);

export function setSentryUser(me: SentryUser$data | null) {
  if (me) Sentry.setUser({ id: me.uid });
  else Sentry.setUser(null);
}
