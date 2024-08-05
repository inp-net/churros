export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * The environment in which the application is running.
       */
      NODE_ENV: string;

      /**
       * The URL of the LDAP server.
       */
      LDAP_URL: string;

      /**
       * The base DN for the LDAP server.
       */
      LDAP_BASE_DN: string;

      /**
       * The bind DN for the LDAP server.
       */
      LDAP_BIND_DN: string;

      /**
       * The bind password for the LDAP server.
       */
      LDAP_BIND_PASSWORD: string;

      /**
       * How logs should be formatted.
       */
      SYNC_LOGS: 'pretty' | 'json' | 'hidden';

      /**
       * The log level for the application.
       */
      SYNC_LOG_LEVEL: number;

      /**
       * The modules used to perform sync.
       */
      SYNC_MODULES: string;
    }
  }
}
