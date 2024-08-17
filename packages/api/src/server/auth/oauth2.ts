import { getUserSession } from '#lib';
import passport from 'passport';
import OAuth2Strategy, { type VerifyCallback } from 'passport-oauth2';
import { api } from '../express.js';

const oauth2Strategy = new OAuth2Strategy(
  {
    authorizationURL: process.env.OAUTH_AUTHORIZE_URL,
    tokenURL: process.env.OAUTH_TOKEN_URL,
    clientID: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    callbackURL: `/auth/oauth2/callback`,
    scope: process.env.OAUTH_SCOPES.split(','),
  },
  async function (
    _accessToken: string,
    _refreshToken: string,
    profile: { [key: string]: unknown },
    cb: VerifyCallback,
  ) {
    try {
      const userSession = await getUserSession(profile[process.env.OAUTH_UID_KEY] as string);

      if (!userSession) {
        cb('This account is not linked to any user', false);
        return;
      }

      cb(null, userSession);
    } catch (error) {
      cb(error, false);
    }
  },
);

oauth2Strategy.userProfile = async function (
  accessToken: string,
  done: (error: unknown, profile: unknown) => void,
) {
  try {
    const res = await fetch(process.env.OAUTH_USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    done(null, await res.json());
  } catch (error) {
    done(error, {});
  }
};

passport.use(oauth2Strategy);

api.get('/auth/oauth2', passport.authenticate('oauth2'));
api.get(
  '/auth/oauth2/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  function (_req, res) {
    res.redirect(process.env.PUBLIC_FRONTEND_ORIGIN); // Successful authentication, redirect home.
  },
);
