import { env } from '$env/dynamic/public';
import { CURRENT_VERSION } from '$lib/buildinfo';
import * as Sentry from '@sentry/sveltekit';
import type { HandleClientError } from '@sveltejs/kit';

// If you don't want to use Session Replay, remove the `Replay` integration,
// `replaysSessionSampleRate` and `replaysOnErrorSampleRate` options.
Sentry.init({
  dsn: env.PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  release: CURRENT_VERSION,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.replayIntegration()],
});

export const handleError: HandleClientError = Sentry.handleErrorWithSentry(({ error }) => {
  console.error(error);
  if (error instanceof Error) {
    console.error(error.stack);
  }
  console.error('Stacktrace: ', new Error().stack);
});
