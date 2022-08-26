declare namespace NodeJS {
  export interface ProcessEnv {
    /** @see https://www.prisma.io/docs/reference/database-reference/connection-urls */
    DATABASE_URL: string;
    /** @see https://yarnpkg.com/advanced/lifecycle-scripts/#environment-variables */
    INIT_CWD: string;
    /** Settings object for reference LDAP servers. */
    LDAP: string;
    /** @see https://yarnpkg.com/advanced/lifecycle-scripts/#environment-variables */
    PROJECT_CWD: string;
    /** Storage directory. */
    STORAGE: string;
  }
}
