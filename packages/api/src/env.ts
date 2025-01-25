import { z } from 'zod';

export const environmentSchema = z.object({
  DATABASE_URL: uri('postgres', 'postgresql').describe(
    'Database connection string. See https://www.prisma.io/docs/reference/database-reference/connection-urls',
  ),
  REDIS_URL: uri('redis').describe('Redis connection string.'),
  PROMETHEUS_URL: optionaluri().describe('Prometheus pushgateway URL.'),
  PUBLIC_FRONTEND_ORIGIN: uri()
    .refine((url) => !url.endsWith('/'))
    .describe("Public frontend origin. Without trailing slash, it's an origin."),
  INIT_CWD: z
    .string()
    .describe('See https://yarnpkg.com/advanced/lifecycle-scripts/#environment-variables'),
  LDAP_SCHOOL: jsonobject({
    servers: z.record(
      z.object({
        url: uri('ldap', 'ldaps').describe('URL of the LDAP server.'),
        filterAttribute: z.string().describe('Attribute to use for filtering.'),
        wholeEmail: z.boolean().describe('Whether the email is the whole login.'),
        attributesMap: z
          .object({
            schoolUid: z.string().describe('Attribute for the school UID.'),
            schoolEmail: z.string().describe('Attribute for the school email.'),
            firstName: z.string().describe('Attribute for the first name.'),
            lastName: z.string().describe('Attribute for the last name.'),
          })
          .describe('Mapping of attributes.'),
      }),
    ),
    emailDomains: z
      .record(z.string())
      .describe('Map student email domains to their corresponding LDAP servers.'),
  })
    .optional()
    .describe('Settings object for school LDAP servers.'),
  PROJECT_CWD: z
    .string()
    .describe('See https://yarnpkg.com/advanced/lifecycle-scripts/#environment-variables'),
  PUBLIC_API_URL: uri().describe('Publicly accessible URL to the (GraphQL) API.'),
  PUBLIC_API_AUTH_URL: uri().describe('Publicly accessible URL to the auth API.'),
  PUBLIC_API_WEBSOCKET_URL: uri('ws', 'wss').describe(
    'Publicly accessible URL to the websocket API.',
  ),
  PUBLIC_STORAGE_URL: uri().describe('Publicly accessible URL to the storage API.'),
  SMTP_URL: optionaluri('smtp').describe(
    'SMTP string, to send emails. See https://nodemailer.com/smtp/',
  ),
  STORAGE: z.string().describe('Storage directory, relative to to working directory of the API.'),
  PUBLIC_SUPPORT_EMAIL: z
    .string()
    .email()
    .describe('The email from which will be sent all emails.'),
  PUBLIC_LYDIA_API_URL: uri().describe('Lydia API URL.'),
  LYDIA_WEBHOOK_URL: uri().describe(
    'Lydia webhook URL: Where Lydia should notify us of payment acknowledgements.',
  ),
  PUBLIC_FOY_GROUPS: z.string().describe('DEPRECATED.').optional(),
  PUBLIC_VAPID_KEY: z.string().describe('Public VAPID key. Used to send push notifications.'),
  VAPID_PRIVATE_KEY: z.string().describe('Private VAPID key. Used to send push notifications.'),
  PUBLIC_CONTACT_EMAIL: z.string().email().describe('Contact email.'),
  PUBLIC_REPOSITORY_URL: uri()
    .describe('URL to the Churros repository. Must be hosted on a Gitlab instance')
    .default('https://git.inpt.fr/churros/churros'),
  GITLAB_PROJECT_ID: z
    .string()
    .regex(/^\d+$/)
    .describe(
      "Internal ID of the Churros project's repo, must correspond to the repository configured with PUBLIC_REPOSITORY_URL.",
    )
    .default('1013'),
  GITLAB_SUDO_TOKEN: z
    .string()
    .optional()
    .describe(
      'Personal access token with sudo, read_api and api scopes. Sudo is required to impersonate a user.',
    ),
  LDAP_URL: uri('ldap', 'ldaps').describe('LDAP URL.'),
  LDAP_BASE_DN: z.string().describe('LDAP base DN.'),
  LDAP_BIND_DN: z.string().describe('LDAP bind DN.'),
  LDAP_BIND_PASSWORD: z.string().describe('LDAP bind password.'),
  MASTER_PASSWORD_HASH: z
    .string()
    .regex(/^\$argon2id\$.*$/)
    .optional()
    .or(z.literal('')) // See https://github.com/colinhacks/zod/issues/310
    .describe('argon2 hash of the master password.'),
  PUBLIC_PAYPAL_CLIENT_ID: z.string().describe('Paypal client ID.'),
  PAYPAL_CLIENT_SECRET: z.string().describe('Paypal client secret.'),
  PUBLIC_PAYPAL_API_BASE_URL: uri().describe('Paypal API base URL.'),
  PUBLIC_SCHOOL_UID: z
    .string()
    .describe(
      "UID of the school to use for the logged-out view of the homepage. The 'main' school of the deployment.",
    ),
  GOOGLE_CLIENT_SECRET: z.string().optional().describe('Google APIs client secret.'),
  PUBLIC_GOOGLE_CLIENT_ID: z.string().optional().describe('Google APIs client ID.'),
  PUBLIC_GOOGLE_WALLET_ISSUER_ID: z.string().optional().describe('Google Wallet issuer ID.'),
  GOOGLE_WALLET_ISSUER_KEY: googleServiceAccountKey().describe('Google Wallet issuer key.'),
  PUBLIC_DEACTIVATE_SIGNUPS: z
    .enum(['true', 'false'])
    .describe('Set to "true" to deactivate signups.'),
  PUBLIC_DEACTIVATE_SIGNUPS_MESSAGE: z
    .string()
    .optional()
    .describe('Custom message to show when users try to hit the /register page.'),
  PUBLIC_OAUTH_ENABLED: z.enum(['1', '0']).describe('Set to "1" to activate oauth2 login.'),
  PUBLIC_OAUTH_CLIENT_ID: z.string().optional().describe('Oauth2 client ID.'),
  PUBLIC_OAUTH_AUTHORIZE_URL: optionaluri().describe('Oauth2 authorize URL.'),
  PUBLIC_OAUTH_TOKEN_URL: optionaluri().describe('Oauth2 token URL.'),
  PUBLIC_OAUTH_USER_INFO_URL: optionaluri().describe('Oauth2 user info URL.'),
  PUBLIC_OAUTH_LOGOUT_URL: optionaluri().describe('Oauth2 logout URL.'),
  PUBLIC_OAUTH_SCOPES: z
    .string()
    .optional()
    .describe('Oauth2 scopes, comma separated.')
    .transform((scopes) => (scopes ? scopes.split(',').map((scope) => scope.trim()) : undefined)),
  OAUTH_UID_KEY: z
    .string()
    .optional()
    .describe(
      "Property to use for the user's uid. Has to be accessible in the user info response.",
    ),
  OAUTH_CLIENT_SECRET: z.string().optional().describe('Oauth2 client secret.'),
  SESSION_SECRET: z.string().describe('express-session secret.'),
  APPLE_WALLET_PEM_CERTIFICATE: z.string().optional().describe('Contents of the .pem certificate.'),
  APPLE_WALLET_PEM_KEY_PASSWORD: z
    .string()
    .optional()
    .describe("The private key's optional password."),
  APPLE_WALLET_PASS_TYPE_ID: z.string().optional().describe('Apple Wallet pass type ID.'),
  APPLE_WALLET_TEAM_ID: z.string().optional().describe('Apple Wallet team ID.'),
  MAILMAN_API_URL: optionaluri().describe('Mailman API URL to handle mailing lists automation.'),
  MAILMAN_API_TOKEN: z.string().optional().describe('Mailman API token.'),
  PUBLIC_GLOBAL_SEARCH_BUMPS: optionaljsonobject({
    Users: z.number().optional(),
    Groups: z.number().optional(),
    Events: z.number().optional(),
    Articles: z.number().optional(),
    Documents: z.number().optional(),
  }).describe(
    "Additive modifier for favoring some types in global search results. A search result's rank is between 0 and 1. JSON object mapping types to rank bumps. Types are values of the `SearchResultType` GraphQL enum. Omitting a value means no bump.",
  ),
  PUBLIC_API_ORIGIN_WEB: optionaluri().describe(
    "Origin of the public API for the web client. Defaults to PUBLIC_API_URL's origin.",
  ),
  PUBLIC_API_ORIGIN_ANDROID: optionaluri().describe(
    "Origin of the public API for the Android client. Defaults to PUBLIC_API_URL's origin.",
  ),
  PUBLIC_API_ORIGIN_IOS: optionaluri().describe(
    "Origin of the public API for the iOS client. Defaults to PUBLIC_API_URL's origin.",
  ),
  PUBLIC_FRONTEND_ORIGIN_ANDROID: optionaluri().describe(
    'Origin of the public frontend for the Android client. Defaults to PUBLIC_FRONTEND_ORIGIN.',
  ),
  PUBLIC_FRONTEND_ORIGIN_IOS: optionaluri().describe(
    'Origin of the public frontend for the iOS client. Defaults to PUBLIC_FRONTEND_ORIGIN.',
  ),
  FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY: googleServiceAccountKey().describe(
    'Firebase Admin SDK service account key. JSON contents of the key file, can be downloaded from the Firebase Admin console. Used to send push notifications to Android & iOS native clients.',
  ),
  PUBLIC_APP_PACKAGE_ID: z
    .string()
    .regex(/^[\d.a-z]+$/)
    .describe('App package ID (Android) and Bundle ID (iOS).'),
  HOUSEKEEPER_TOKEN: z
    .string()
    .min(10)
    .optional()
    .describe('Token to execute Mutation.housekeep. If left empty, the mutation is unavailable.'),
  USER_DELETED_WEBHOOK: optionaluri().describe(
    "When someone deletes their account, a GET request to this URL will be made with the user's UID as the ?user query parameter.",
  ),
});

function googleServiceAccountKey() {
  return optionaljsonobject({
    type: z.literal('service_account'),
    project_id: z.string(),
    private_key_id: z.string(),
    private_key: privatekey(),
    client_email: z.string().email(),
    client_id: z.string(),
    auth_uri: uri(),
    token_uri: uri(),
    auth_provider_x509_cert_url: uri(),
    client_x509_cert_url: uri(),
    universe_domain: z.string(),
  });
}

function uri(...protocols: string[]) {
  return z
    .string()
    .trim()
    .url()
    .refine((url) =>
      (protocols.length > 0 ? protocols : ['http', 'https']).some((protocol) =>
        url.startsWith(`${protocol}://`),
      ),
    );
}

function optionaluri(...protocols: string[]) {
  return z
    .string()
    .trim()
    .url()
    .refine((url) =>
      (protocols.length > 0 ? protocols : ['http', 'https']).some((protocol) =>
        url.startsWith(`${protocol}://`),
      ),
    )
    .or(z.literal('').transform(() => {}))
    .optional();
}

function jsonobject<Shape extends z.ZodRawShape, Params extends z.RawCreateParams>(
  shape: Shape,
  params?: Params,
) {
  return z
    .string()
    .transform((x, ctx) => {
      // See https://github.com/colinhacks/zod/issues/2918#issuecomment-1800824755
      try {
        return JSON.parse(x);
      } catch (error) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid JSON: ${error}` });
        return z.NEVER;
      }
    })
    .pipe(z.object(shape, params));
}

function optionaljsonobject<Shape extends z.ZodRawShape, Params extends z.RawCreateParams>(
  shape: Shape,
  params?: Params,
) {
  return z
    .string()
    .optional()
    .transform((x, ctx) => {
      if (!x) return;
      // See https://github.com/colinhacks/zod/issues/2918#issuecomment-1800824755
      try {
        return JSON.parse(x);
      } catch (error) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid JSON: ${error}` });
        return z.NEVER;
      }
    })
    .pipe(z.object(shape, params).or(z.undefined()));
}

function privatekey() {
  return z
    .string()
    .trim()
    .startsWith('-----BEGIN PRIVATE KEY-----')
    .endsWith('-----END PRIVATE KEY-----');
}
