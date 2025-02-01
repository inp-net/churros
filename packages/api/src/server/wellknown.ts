import { CURRENT_VERSION, ENV } from '#lib';
import { api } from './express.js';

console.info(`Serving server manifest on /.well-known/churros.app/server.json`);
api.get('/.well-known/churros.app/server.json', async (_req, res) => {
  res.json({
    version: CURRENT_VERSION,
    urls: {
      api: ENV.PUBLIC_API_URL,
      auth: ENV.PUBLIC_API_AUTH_URL,
    },
    oauth: {
      enabled: ENV.PUBLIC_OAUTH_ENABLED === '1',
      authorizeUrl: ENV.PUBLIC_OAUTH_AUTHORIZE_URL,
      tokenUrl: ENV.PUBLIC_OAUTH_TOKEN_URL,
      clientId: ENV.PUBLIC_OAUTH_CLIENT_ID,
      userInfoUrl: ENV.PUBLIC_OAUTH_USER_INFO_URL,
      scopes: ENV.PUBLIC_OAUTH_SCOPES?.join(' '),
    },
    emails: {
      contact: ENV.PUBLIC_CONTACT_EMAIL,
      support: ENV.PUBLIC_SUPPORT_EMAIL,
    },
  });
});
