import { daysToSeconds, ENV, getSessionUser, redisClient } from '#lib';
import { type User } from '@churros/db/prisma';
import RedisStore from 'connect-redis';
import session from 'express-session';
import passport from 'passport';

passport.serializeUser<User['uid']>((user, done) => {
  if (!user.user) {
    throw new Error(
      "Cannot use session cookie with group access token - please include the token as a Bearer token in the request's Authorization header",
    );
  }
  done(null, user.user.uid);
});

passport.deserializeUser<User['uid']>(async (session, done) => {
  try {
    const user = await getSessionUser(session);
    done(null, { user });
  } catch (error) {
    done(error, null);
  }
});

const redisStore = new RedisStore({
  client: redisClient(),
  prefix: 'session:',
  ttl: daysToSeconds(31), // 31 days
});

export default session({
  store: redisStore,
  secret: ENV().SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: daysToSeconds(365), // 1 year
    secure: 'auto',
    sameSite: 'lax',
  },
});
