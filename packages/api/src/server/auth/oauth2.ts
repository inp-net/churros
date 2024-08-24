import { getSessionUser } from '#lib';
import passport from 'passport';
import OAuth2Strategy, { type VerifyCallback } from 'passport-oauth2';
import { api } from '../express.js';
import { AUTHED_VIA_COOKIE_NAME, AuthedViaCookie } from './constants.js';

const oauth2Strategy = new OAuth2Strategy(
  {
    authorizationURL: process.env.PUBLIC_OAUTH_AUTHORIZE_URL,
    tokenURL: process.env.PUBLIC_OAUTH_TOKEN_URL,
    clientID: process.env.PUBLIC_OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    callbackURL: '/auth/oauth2/callback',
    scope: process.env.PUBLIC_OAUTH_SCOPES.split(','),
  },
  async function (
    _accessToken: string,
    _refreshToken: string,
    profile: { [key: string]: unknown },
    cb: VerifyCallback,
  ) {
    try {
      const userSession = await getSessionUser(profile[process.env.OAUTH_UID_KEY] as string);

      if (!userSession) {
        cb('This account is not linked to any user', false);
        return;
      }

      cb(null, { user: userSession });
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
    const res = await fetch(process.env.PUBLIC_OAUTH_USER_INFO_URL, {
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

api.get('/auth/oauth2', (req, res, next) => {
  // Thanks express
  const searchParams = new URL(`http://localhost${req.url}`).searchParams;

  passport.authenticate('oauth2', {
    // @ts-expect-error undocumented option
    callbackURL: new URL(
      `/auth/oauth2/callback?${new URLSearchParams({ from: searchParams.get('from') ?? '' })}`,
      process.env.PUBLIC_API_URL,
    ).toString(),
  })(req, res, next);
});
api.get(
  '/auth/oauth2/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  function (req, res) {
    // Thanks express
    const searchParams = new URL(`http://localhost${req.url}`).searchParams;

    res.cookie(AUTHED_VIA_COOKIE_NAME, AuthedViaCookie.OAUTH2, { httpOnly: false, secure: false });
    res.redirect(
      new URL(searchParams.get('from') ?? '/', process.env.PUBLIC_FRONTEND_ORIGIN).toString(),
    ); // Successful authentication, redirect home.
  },
);
