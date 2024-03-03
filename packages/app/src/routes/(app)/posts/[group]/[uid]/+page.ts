import type { PostPageVariables } from './$houdini';

// TODO make houdini understand that $loggedIn is builtin from a client plugin
export const _PostPageVariables: PostPageVariables = async ({ params }) =>
  params as ReturnType<PostPageVariables>;
