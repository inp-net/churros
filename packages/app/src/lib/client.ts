import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { ClientPlugin } from '$houdini';
import { HoudiniClient, subscription } from '$houdini';
import { redirectToLogin } from '$lib/session';
import { createClient } from 'graphql-ws';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../../../api/src/lib/errors.js';

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
    console.info(`Fetching ${ctx.name}`);
    next(ctx);
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
    // console.log(
    //   `fetching client params from token ${JSON.stringify(
    //     session?.token,
    //   )}, varaibles ${JSON.stringify(variables)}`,
    // );
    return {
      headers: {
        Authorization: session?.token ? `Bearer ${session.token}` : '',
      },
    };
  },
});
