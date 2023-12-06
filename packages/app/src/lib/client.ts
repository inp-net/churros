import { env } from '$env/dynamic/public';
import { HoudiniClient } from '$houdini';

export default new HoudiniClient({
  url: env.PUBLIC_API_URL,
  fetchParams({ session }) {
    return {
      headers: {
        Authorization: `Bearer ${session?.token}`,
      },
    };
  },
});
