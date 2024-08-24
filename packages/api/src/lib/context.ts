import type { SessionUser } from '#lib';
import type { YogaInitialContext } from '@graphql-yoga/node';
import type { SessionGroup } from './session-group.js';

type ContextOptions = YogaInitialContext & {
  req: Express.Request;
  res: Express.Response;
  caveats: string[];
};

function baseContext() {
  return {
    user: null,
    group: null,
    caveats: [] as string[],
  };
}

/** The request context, made available in all resolvers. */
export async function context(ctx: ContextOptions): Promise<Context> {
  if (!ctx.req) return { ...ctx, ...baseContext() };

  // Express's 'user" could be a group when using a Group Access Token
  const userOrGroup = ctx.req.user;

  return {
    ...ctx,
    ...baseContext(),
    ...userOrGroup,
  };
}

export type Context = ContextOptions & {
  user: SessionUser | null;
  group: SessionGroup | null;
};
