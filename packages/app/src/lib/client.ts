import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { ClientPlugin } from '$houdini';
import { HoudiniClient } from '$houdini';
import { redirectToLogin } from '$lib/session';
import { UNAUTHORIZED_ERROR_MESSAGE } from '@inp-net/churros-client';

const isLoggedIn: ClientPlugin = () => {
  return {
    start(ctx, { next }) {
      ctx.variables = { ...ctx.variables, loggedIn: !!ctx.session?.token };

      // log the variables
      console.log(
        `isLoggedIn plugin: session ${JSON.stringify(ctx.session)}, vars ${JSON.stringify(
          ctx.variables,
        )}`,
      );

      // move onto the next step in the pipeline
      next(ctx);
    },
  };
};

const unauthorizedErrorHandler: ClientPlugin = () => {
  return {
    end(ctx, { value: { errors }, resolve }) {
      if (
        browser &&
        !ctx.variables?.loggedIn &&
        errors?.some((e) => e.message === UNAUTHORIZED_ERROR_MESSAGE)
      ) {
        const url = new URL(window.location.href);
        throw redirectToLogin(url.pathname, Object.fromEntries(url.searchParams.entries()));
      }

      resolve(ctx);
    },
  };
};

export default new HoudiniClient({
  url: env.PUBLIC_API_URL,
  plugins: [isLoggedIn, unauthorizedErrorHandler],
  fetchParams({ session, variables }) {
    console.log(
      `fetching client params from token ${JSON.stringify(
        session?.token,
      )}, varaibles ${JSON.stringify(variables)}`,
    );
    return {
      headers: {
        Authorization: `Bearer ${session?.token}`,
      },
    };
  },
});
