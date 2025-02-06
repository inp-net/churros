import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { ClientPlugin } from '$houdini';
import { HoudiniClient, subscription } from '$houdini';
import { redirectToLogin } from '$lib/session';
import { createClient } from 'graphql-ws';

// XXX: must be the same as in the API
// TODO: use a separate error instead
const UNAUTHORIZED_ERROR_MESSAGE = "Tu n'es pas autorisé à effectuer cette action.";

const unauthorizedErrorHandler: ClientPlugin = () => {
  return {
    end(ctx, { value: { errors }, resolve }) {
      if (
        browser &&
        !ctx.variables?.loggedIn &&
        ctx.artifact.name.startsWith('Page') &&
        errors?.some((e) => e.message === UNAUTHORIZED_ERROR_MESSAGE)
      ) {
        const url = new URL(window.location.href);
        throw redirectToLogin(url.pathname, url.searchParams);
      }

      resolve(ctx);
    },
  };
};

const logger: ClientPlugin = () => ({
  start(ctx, { next }) {
    // add the start time to the context's stuff
    ctx.metadata = {
      ...ctx.metadata,
      queryTimestamps: {
        global: Date.now(),
        network: 0,
      },
    };

    // move onto the next plugin
    next(ctx);
  },
  beforeNetwork(ctx, { next }) {
    console.info(`${ctx.name}: Hitting network`);
    if (ctx.metadata?.queryTimestamps) ctx.metadata.queryTimestamps.network = Date.now();

    next(ctx);
  },
  afterNetwork(ctx, { resolve }) {
    if (ctx.metadata?.queryTimestamps?.network) {
      console.info(
        `${ctx.name}: Hitting network: took ${Date.now() - ctx.metadata.queryTimestamps.network}ms`,
      );
    }
    resolve(ctx);
  },
  end(ctx, { resolve }) {
    // compute the difference in time between the
    // date we created on `start` and now
    if (ctx.metadata) {
      // const diff = Math.abs(Date.now() - ctx.metadata.queryTimestamps.global);
      // console.info(`[${ctx.session?.token ?? 'loggedout'}] ${ctx.name}: took ${diff}ms`);
    }

    // we're done
    resolve(ctx);
  },
});

const subscriptionPlugin = subscription(({ session }) =>
  createClient({
    url: env.PUBLIC_API_WEBSOCKET_URL,
    connectionParams: () => ({
      headers: {
        Authorization: session?.token ? `Bearer ${session.token}` : '',
      },
    }),
  }),
);

export default new HoudiniClient({
  url: env.PUBLIC_API_URL,
  plugins: [logger, subscriptionPlugin, unauthorizedErrorHandler],
  fetchParams({ session }) {
    return {
      credentials: 'include',
      headers: {
        Authorization: session?.token ? `Bearer ${session.token}` : '',
      },
    };
  },
});
