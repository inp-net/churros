import { getSessionUser, prisma } from '#lib';
import { nanoid } from 'nanoid';
import passport from 'passport';
import OAuth2Strategy, { type VerifyCallback } from 'passport-oauth2';
import { api } from '../express.js';
import { AUTHED_VIA_COOKIE_NAME, AuthedViaCookie } from './constants.js';

const oauth2Strategy = new OAuth2Strategy(
  {
    // TODO: _actually_ support not configuring PUBLIC_OAUTH_*
    authorizationURL: ENV.PUBLIC_OAUTH_AUTHORIZE_URL ?? '',
    tokenURL: ENV.PUBLIC_OAUTH_TOKEN_URL ?? '',
    clientID: ENV.PUBLIC_OAUTH_CLIENT_ID ?? '',
    clientSecret: ENV.OAUTH_CLIENT_SECRET ?? '',
    callbackURL: '/auth/oauth2/callback',
    scope: ENV.PUBLIC_OAUTH_SCOPES ?? [],
  },
  async function (
    _accessToken: string,
    _refreshToken: string,
    profile: { [key: string]: unknown },
    cb: VerifyCallback,
  ) {
    try {
      if (!ENV.OAUTH_UID_KEY) {
        cb('OAUTH_UID_KEY is not set', false);
        return;
      }

      const userSession = await getSessionUser(profile[ENV.OAUTH_UID_KEY] as string);

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
  if (!ENV.PUBLIC_OAUTH_USER_INFO_URL) {
    done('PUBLIC_OAUTH_USER_INFO_URL is not set', {});
    return;
  }
  try {
    const res = await fetch(ENV.PUBLIC_OAUTH_USER_INFO_URL, {
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

function forwardSearchParams(params: URLSearchParams, keys: string[]): URLSearchParams {
  return new URLSearchParams(Array.from(params.entries()).filter(([key]) => keys.includes(key)));
}

api.get('/auth/oauth2', (req, res, next) => {
  // Thanks express
  const searchParams = new URL(`http://localhost${req.url}`).searchParams;

  passport.authenticate('oauth2', {
    // @ts-expect-error undocumented option
    callbackURL: new URL(
      `/auth/oauth2/callback?${forwardSearchParams(searchParams, ['from', 'native'])}`,
      process.env.PUBLIC_API_URL,
    ).toString(),
  })(req, res, next);
});
api.get(
  '/auth/oauth2/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  async function (req, res) {
    // Thanks express
    const searchParams = new URL(`http://localhost${req.url}`).searchParams;

    res.cookie(AUTHED_VIA_COOKIE_NAME, AuthedViaCookie.OAUTH2, { httpOnly: false, secure: false });

    // ?native=1 is used to create a local token instead of setting a HttpOnly cookie,
    // since native apps don't support them.
    let token: string | undefined;
    if (searchParams.get('native') === '1') {
      token = await prisma.credential
        .create({
          data: {
            type: 'Token',
            value: nanoid(30),
            user: {
              connect: {
                uid: req.user?.user?.uid,
              },
            },
          },
        })
        .then((cred) => cred.value);
    }

    const outputParams = new URLSearchParams({
      from: searchParams.get('from') ?? '/',
      token: token ?? '',
    });

    let redirectURL: string;
    if (searchParams.get('native') === '1') {
      // Native app logins get redirected to the app via a custom URL scheme whose name is the package ID
      redirectURL = `${process.env.PUBLIC_APP_PACKAGE_ID}://login/done?${outputParams}`;
    } else {
      // Web logins get redirected to the frontend
      redirectURL = new URL('/login/done', process.env.PUBLIC_FRONTEND_ORIGIN).toString();
    }

    res.redirect(redirectURL);
  },
);
