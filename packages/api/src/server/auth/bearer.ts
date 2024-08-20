import passport from 'passport';
import { type IVerifyOptions, Strategy as BearerStrategy } from 'passport-http-bearer';
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
    const session = await getTokenSession(token);
    done(null, session);
  } catch (error) {
    done(error);
  }
});

passport.use(bearerStrategy);
