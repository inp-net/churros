import { z } from 'zod';

/**
 * Returns true if the server is running in development mode.
 */
export function inDevelopment() {
  return process.env['NODE_ENV'] === 'development';
}

export const environmentSchema = z.object({
  /**
   * Database connection string.
   *
   * @see https://www.prisma.io/docs/reference/database-reference/connection-urls
   */
  DATABASE_URL: z.string().min(1),
  /**
   * Redis connection string.
   */
  REDIS_URL: z.string().min(1).url(),
  /**
   * Prometheus pushgateway URL.
   */
  PROMETHEUS_URL: z.string().url(),
  /**
   * Public frontend origin.
   *
   * @example
   *   'https://example.com';
   *
   * @remark /!\ Without trailing slash, it's an origin
   */
  FRONTEND_ORIGIN: z.string().min(1).url(),
  /** @see https://yarnpkg.com/advanced/lifecycle-scripts/#environment-variables */
  INIT_CWD: z.string().min(1),
  /** Settings object for reference LDAP servers. */
  LDAP_SCHOOL: z.string().min(1), // TODO validate as JSON string
  /** @see https://yarnpkg.com/advanced/lifecycle-scripts/#environment-variables */
  PROJECT_CWD: z.string().min(1),
  PUBLIC_API_URL: z.string().min(1).url(),
  /**
   * SMTP options string.
   *
   * @see https://nodemailer.com/smtp/
   */
  SMTP_URL: z.string().min(1).url(),
  /** Storage directory, relative to to working directory of the API. */
  STORAGE: z.string().min(1),
  /** The email from which will be sent all emails. */
  PUBLIC_SUPPORT_EMAIL: z.string().min(1).email(),
  /** Lydia API URL. */
  PUBLIC_LYDIA_API_URL: z.string().min(1).url(),
  /**
   * Foy groups. Only users that are part of the bureau of one of these groups can create/modify
   * bar weeks. Must be a comma-separated list of group UIDs.
   */
  PUBLIC_FOY_GROUPS: z.string(),
  /** VAPID keys */
  PUBLIC_VAPID_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  /** Contact email (used for push notifications and maybe other things) */
  PUBLIC_CONTACT_EMAIL: z.string().min(1).email(),
  /** Gitlab API info, for the issue creation form */
  GITLAB_PROJECT_ID: z.string().regex(/\d+/), // Id of the repo
  GITLAB_SUDO_TOKEN: z.string().optional(), // personnal access token with sudo, read_api and api scopes. Sudo is required to impersonate a user so that we can say that he created it
  /** Old LDAP URL (used to migrate passwords) */
  OLD_LDAP_URL: z.string().url().optional(),
  OLD_LDAP_CLIENT_CONSULT_DN: z.string().optional(),
  OLD_LDAP_CLIENT_CONSULT_PASSWORD: z.string().optional(),
  LDAP_BASE_DN: z.string().min(1),
  LDAP_BIND_DN: z.string().min(1),
  LDAP_BIND_PASSWORD: z.string().min(1),
  /** Master password's hash (allows impersonation) */
  MASTER_PASSWORD_HASH: z.string().optional(),
  /** Paypal secrets */
  PUBLIC_PAYPAL_CLIENT_ID: z.string(),
  PAYPAL_CLIENT_SECRET: z.string(),
  PUBLIC_PAYPAL_API_BASE_URL: z.string().min(1),
  PUBLIC_SCHOOL_UID: z.string().min(1),
  /** Google secrets */
  GOOGLE_CLIENT_SECRET: z.string(),
  PUBLIC_GOOGLE_CLIENT_ID: z.string(),
  PUBLIC_GOOGLE_WALLET_ISSUER_ID: z.string(),
  GOOGLE_WALLET_ISSUER_KEY: z.string(), // TODO validate as JSON string
});
