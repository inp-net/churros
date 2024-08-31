import passport from 'passport';
import { type IVerifyOptions, Strategy as BearerStrategy } from 'passport-http-bearer';
import { getGATSession } from '../../lib/gat-session.js';
import { getTokenSession } from '../../lib/token-session.js';

const bearerStrategy = new BearerStrategy(async function (
  token: string,
  done: (
    error: unknown,
    user?: Express.User | null,
    options?: string | IVerifyOptions | undefined,
  ) => void,
): Promise<void> {
  try {
    const user = await getTokenSession(token);
    if (user) {
      done(null, { user: user });
    } else {
      const group = await getGATSession(token);
      if (group) done(null, { group });
      else done(null, null);
    }
  } catch (error) {
    done(error);
  }
});

passport.use(bearerStrategy);
