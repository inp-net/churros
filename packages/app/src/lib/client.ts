import { env } from '$env/dynamic/public';
import type { ClientPlugin } from '$houdini';
import { HoudiniClient } from '$houdini';

const isLoggedIn: ClientPlugin = () => {
  return {
    start(ctx, { next }) {
      console.log(ctx.session);
      ctx.variables = { ...ctx.variables, loggedIn: !!ctx.session?.me };

      // log the variables
      console.log(ctx.variables);

      // move onto the next step in the pipeline
      next(ctx);
    },
  };
};

export default new HoudiniClient({
  url: env.PUBLIC_API_URL,
  plugins: [isLoggedIn],
  fetchParams({ session, variables }) {
    console.log(
      `fetching client params from token ${JSON.stringify(
        session.token,
      )}, varaibles ${JSON.stringify(variables)}`,
    );
    return {
      headers: {
        Authorization: `Bearer ${session?.token}`,
      },
    };
  },
});
