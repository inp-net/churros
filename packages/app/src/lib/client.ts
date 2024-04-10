import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { ClientPlugin } from '$houdini';
import { HoudiniClient } from '$houdini';
import { redirectToLogin } from '$lib/session';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../../../api/src/lib/error.js';

const unauthorizedErrorHandler: ClientPlugin = () => {
  return {
    end(ctx, { value: { errors }, resolve }) {
      if (
        browser &&
        !ctx.variables?.loggedIn &&
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

export default new HoudiniClient({
  url: env.PUBLIC_API_URL,
  plugins: [logger, unauthorizedErrorHandler],
  fetchParams({ session, variables }) {
    // console.log(
    //   `fetching client params from token ${JSON.stringify(
    //     session?.token,
    //   )}, varaibles ${JSON.stringify(variables)}`,
    // );
    console.log({ variables });
    return {
      headers: {
        Authorization: `Bearer ${session?.token}`,
      },
    };
  },
});
