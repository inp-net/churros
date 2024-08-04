export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      LDAP_URL: string;
      LDAP_BASE_DN: string;
      LDAP_BIND_DN: string;
      LDAP_BIND_PASSWORD: string;
      SYNC_LOGS: 'pretty' | 'json' | 'hidden';
      SYNC_LOG_LEVEL: number;
      SYNC_MODULES: string;
    }
  }
}
