import { getSessionUser, prisma } from '#lib';
import { nanoid } from 'nanoid';
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

function forwardSearchParams(params: URLSearchParams, keys: string[]): URLSearchParams {
  return new URLSearchParams(Array.from(params.entries()).filter(([key]) => keys.includes(key)));
}

api.get('/auth/oauth2', (req, res, next) => {
  // Thanks express
  const searchParams = new URL(`http://localhost${req.url}`).searchParams;

  passport.authenticate('oauth2', {
    // @ts-expect-error undocumented option
    callbackURL: new URL(
      `/auth/oauth2/callback?${forwardSearchParams(searchParams, ['from', 'include_token_in_url', 'protocol'])}`,
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
    const outputParams = new URLSearchParams({
      from: searchParams.get('from') ?? '/',
      token:
        searchParams.get('include_token_in_url') === '1'
          ? await prisma.credential
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
              .then((cred) => cred.value)
          : '',
    });
    res.redirect(
      `${searchParams.has('protocol') ? `${searchParams.get('protocol')}//login/done` : new URL('/login/done', process.env.PUBLIC_FRONTEND_ORIGIN)}?${outputParams}`,
    );
  },
);
