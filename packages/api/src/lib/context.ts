import type { YogaInitialContext } from '@graphql-yoga/node';

type ContextOptions = YogaInitialContext & {
  req: Express.Request;
  res: Express.Response;
  caveats: string[];
};

function baseContext() {
  return {
    user: null,
    caveats: [] as string[],
  };
}

/** The request context, made available in all resolvers. */
export const context = async ({ req }: ContextOptions) => {
  if (!req) return baseContext();

  const { user } = req;

  return {
    ...baseContext(),
    user: user ?? null,
  };
};

export type Context = ContextOptions & {
  user: Express.User | null;
};
