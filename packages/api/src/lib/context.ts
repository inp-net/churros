import type { YogaInitialContext } from '@graphql-yoga/node';

type ContextOptions = YogaInitialContext & {
  req: Express.Request;
  res: Express.Response;
};

/** The request context, made available in all resolvers. */
export const context = async ({ req }: ContextOptions) => {
  const { user } = req;
  if (!user) return {};

  return {
    user: user,
  };
};

export type Context = ContextOptions & {
  user: Express.User;
};
