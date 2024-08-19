import { getSessionUser, redisClient } from '#lib';
import { type User } from '@churros/db/prisma';
import RedisStore from 'connect-redis';
import session from 'express-session';
import passport from 'passport';

passport.serializeUser<User['uid']>((user, done) => {
  done(null, user.uid);
});

passport.deserializeUser<User['uid']>(async (session, done) => {
  try {
    const user = await getSessionUser(session);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const redisStore = new RedisStore({
  client: redisClient(),
  prefix: 'session:',
  ttl: 60 * 60 * 24 * 31, // 31 days
});

export default session({
  store: redisStore,
  secret: 'something-to-change-for-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    secure: 'auto',
    sameSite: 'lax',
  },
});
