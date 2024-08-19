import {
  type Credential,
  type Event,
  type EventManager,
  type Group,
  type GroupMember,
  type Major,
  type User as PrismaUser,
  type School,
  type StudentAssociation,
} from '@churros/db/prisma';

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      /**
       * Database connection string.
       *
       * @see https://www.prisma.io/docs/reference/database-reference/connection-urls
       */
      DATABASE_URL: string;
      /**
       * Redis connection string.
       */
      REDIS_URL: string;
      /**
       * Prometheus pushgateway URL.
       */
      PROMETHEUS_URL: string;
      /**
       * Public frontend origin.
       *
       * @example
       *   'https://example.com';
       *
       * @remark /!\ Without trailing slash, it's an origin
       */
      PUBLIC_FRONTEND_ORIGIN: string;
      /** @see https://yarnpkg.com/advanced/lifecycle-scripts/#environment-variables */
      INIT_CWD: string;
      /** Settings object for reference LDAP servers. */
      LDAP_SCHOOL: string;
      /** @see https://yarnpkg.com/advanced/lifecycle-scripts/#environment-variables */
      PROJECT_CWD: string;
      PUBLIC_API_URL: string;
      PUBLIC_API_AUTH_URL: string;
      PUBLIC_API_WEBSOCKET_URL: string;
      PUBLIC_STORAGE_URL: string;
      /**
       * SMTP options string.
       *
       * @see https://nodemailer.com/smtp/
       */
      SMTP_URL: string;
      /** Storage directory, relative to to working directory of the API. */
      STORAGE: string;
      /** The email from which will be sent all emails. */
      PUBLIC_SUPPORT_EMAIL: string;
      /** Lydia API URL. */
      PUBLIC_LYDIA_API_URL: string;
      /**
       * Foy groups. Only users that are part of the bureau of one of these groups can create/modify
       * bar weeks. Must be a comma-separated list of group UIDs.
       */
      PUBLIC_FOY_GROUPS: string;
      /** VAPID keys */
      PUBLIC_VAPID_KEY: string;
      VAPID_PRIVATE_KEY: string;
      /** Contact email (used for push notifications and maybe other things) */
      PUBLIC_CONTACT_EMAIL: string;
      /** Gitlab API info, for the issue creation form */
      GITLAB_PROJECT_ID: string; // Id of the repo
      GITLAB_SUDO_TOKEN: string; // personnal access token with sudo, read_api and api scopes. Sudo is required to impersonate a user so that we can say that he created it
      /** LDAP URL */
      LDAP_URL: string;
      LDAP_BASE_DN: string;
      LDAP_BIND_DN: string;
      LDAP_BIND_PASSWORD: string;
      /** Master password's hash (allows impersonation) */
      MASTER_PASSWORD_HASH: string;
      /** Paypal secrets */
      PUBLIC_PAYPAL_CLIENT_ID: string;
      PAYPAL_CLIENT_SECRET: string;
      PUBLIC_PAYPAL_API_BASE_URL: string;
      PUBLIC_SCHOOL_UID: string;
      /** Google secrets */
      GOOGLE_CLIENT_SECRET: string;
      PUBLIC_GOOGLE_CLIENT_ID: string;
      PUBLIC_GOOGLE_WALLET_ISSUER_ID: string;

      GOOGLE_WALLET_ISSUER_KEY: string;
      /** Mailman secrets */
      MAILMAN_API_URL: string;
      MAILMAN_API_TOKEN: string;
      /** Set to "true" to deactivate signups */
      PUBLIC_DEACTIVATE_SIGNUPS: string;
      /**  Custom message to show when users try to hit the /register page */
      PUBLIC_DEACTIVATE_SIGNUPS_MESSAGE: string;

      /** Set to "true" to activate oauth2 login */
      PUBLIC_OAUTH_ENABLED: string;
      /** Oauth2 client secrets */
      PUBLIC_OAUTH_CLIENT_ID: string;
      PUBLIC_OAUTH_AUTHORIZE_URL: string;
      PUBLIC_OAUTH_TOKEN_URL: string;
      PUBLIC_OAUTH_USER_INFO_URL: string;
      PUBLIC_OAUTH_LOGOUT_URL: string;
      /** Oauth2 scopes, comma separated */
      PUBLIC_OAUTH_SCOPES: string;
      /** Oauth2 UID key */
      OAUTH_UID_KEY: string;
      OAUTH_CLIENT_SECRET: string;

      /** express-session secret */
      SESSION_SECRET: string;
    }
  }

  namespace Express {
    interface User extends PrismaUser {
      fullName: string;
      yearTier: number;
      groups: Array<GroupMember & { group: Group }>;
      major: null | (Major & { schools: School[] });
      managedEvents: Array<EventManager & { event: Event & { group: Group } }>;
      adminOfStudentAssociations: StudentAssociation[];
      canEditGroups: StudentAssociation[];
      /** The credential (only token) used to authenticate the user. */
      credential?: Credential['value'];
    }
  }
}
