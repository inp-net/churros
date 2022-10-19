declare namespace NodeJS {
  export interface ProcessEnv {
    /**
     * Database connection string.
     *
     * @see https://www.prisma.io/docs/reference/database-reference/connection-urls
     */
    DATABASE_URL: string;
    /**
     * Public frontend origin.
     *
     * @example
     *   'https://example.com';
     *
     * @remark /!\ Without trailing slash, it's an origin
     */
    FRONTEND_ORIGIN: string;
    /** @see https://yarnpkg.com/advanced/lifecycle-scripts/#environment-variables */
    INIT_CWD: string;
    /** Settings object for reference LDAP servers. */
    LDAP: string;
    /** @see https://yarnpkg.com/advanced/lifecycle-scripts/#environment-variables */
    PROJECT_CWD: string;
    /**
     * SMTP options string.
     *
     * @see https://nodemailer.com/smtp/
     */
    SMTP_URL: string;
    /** Storage directory. */
    STORAGE: string;
    /** The email from which will be sent all emails. */
    SUPPORT_EMAIL: string;
  }
}
