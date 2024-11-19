import { getGATSession, getTokenSession } from '#lib';
import passport from 'passport';
import CookieStragegy from 'passport-cookie';
import type { VerifyCallback } from 'passport-oauth2';

const tokenCookieStrategy = new CookieStragegy(
  {
    cookieName: 'token',
  },
  async (token: string | null, done: VerifyCallback) => {
    if (!token) {
      done(null, undefined);
      return;
    }

    try {
      const user = await getTokenSession(token);
      if (user) {
        done(null, { user: user });
      } else {
        const group = await getGATSession(token);
        if (group) done(null, { group });
        else done(null, undefined);
      }
    } catch (error) {
      done(error);
    }
  },
);

passport.use(tokenCookieStrategy);
