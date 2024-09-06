import { graphql } from '$houdini';
import * as Sentry from '@sentry/sveltekit';

export async function load(event) {
  const SentryUser = await graphql(`
    query RootLayoutSentryUser {
      me {
        ...SentryUser @mask_disable
      }
    }
  `)
    .fetch({ event })
    .then((result) => result.data?.me);

  if (SentryUser) Sentry.setUser({ id: SentryUser.uid });

  return { mobile: event.locals.mobile };
}
