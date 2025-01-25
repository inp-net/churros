import { builder, graphinx } from '#lib';

export type HealthCheck = {
  redis: { publish: boolean; subscribe: boolean };
  database: { prisma: boolean };
  ldap: { school: boolean | null; internal: boolean };
  mail: { smtp: boolean | null };
  features: {
    prometheus: boolean;
    gitlab: boolean;
    googleAPIs: boolean;
    googleWallet: boolean;
    appleWallet: boolean;
    oauth: boolean;
    mailman: boolean;
    housekeeper: boolean;
  };
};

export const HealthCheckType = builder.objectRef<HealthCheck>('HealthCheck').implement({
  description: 'Results of a health self-check',
  fields: (t) => ({
    redis: t.field({
      type: builder.objectRef<HealthCheck['redis']>('RedisHealthCheck').implement({
        ...graphinx('health-checks'),
        fields: (t) => ({
          subscribe: t.boolean({
            description: 'Whether the Redis subscriber client is ready',
            resolve: ({ subscribe }) => subscribe,
          }),
          publish: t.boolean({
            description: 'Whether the Redis publisher client is ready',
            resolve: ({ publish }) => publish,
          }),
        }),
      }),
      resolve: ({ redis }) => redis,
    }),
    database: t.field({
      type: builder.objectRef<HealthCheck['database']>('DatabaseHealthCheck').implement({
        ...graphinx('health-checks'),
        fields: (t) => ({
          prisma: t.boolean({
            resolve: ({ prisma }) => prisma,
          }),
        }),
      }),
      resolve: ({ database }) => database,
    }),
    ldap: t.field({
      type: builder.objectRef<HealthCheck['ldap']>('LdapHealthCheck').implement({
        ...graphinx('health-checks'),
        fields: (t) => ({
          school: t.boolean({
            description:
              'Whether the LDAP school client is ready. Null when no LDAP_SCHOOL has been configured.',
            nullable: true,
            resolve: ({ school }) => school,
          }),
          internal: t.boolean({
            description: 'Whether the LDAP internal client is ready',
            resolve: ({ internal }) => internal,
          }),
        }),
      }),
      resolve: ({ ldap }) => ldap,
    }),
    mail: t.field({
      type: builder.objectRef<HealthCheck['mail']>('MailHealthCheck').implement({
        ...graphinx('health-checks'),
        fields: (t) => ({
          smtp: t.boolean({
            description: 'Whether the SMTP client is ready. Null if no SMTP_URL is configured.',
            nullable: true,
            resolve: ({ smtp }) => smtp,
          }),
        }),
      }),
      resolve: ({ mail }) => mail,
    }),
    features: t.field({
      type: builder.objectRef<HealthCheck['features']>('FeaturesHealthCheck').implement({
        ...graphinx('health-checks'),
        fields: (t) => ({
          prometheus: t.boolean({
            description: 'Whether the Prometheus pushgateway is configured',
            resolve: ({ prometheus }) => prometheus,
          }),
          gitlab: t.boolean({
            description: 'Whether the GitLab API is configured',
            resolve: ({ gitlab }) => gitlab,
          }),
          googleAPIs: t.boolean({
            description: 'Whether Google APIs are configured',
            resolve: ({ googleAPIs }) => googleAPIs,
          }),
          googleWallet: t.boolean({
            description: 'Whether Google Wallet integration is configured',
            resolve: ({ googleWallet }) => googleWallet,
          }),
          appleWallet: t.boolean({
            description: 'Whether Apple Wallet integration is configured',
            resolve: ({ appleWallet }) => appleWallet,
          }),
          oauth: t.boolean({
            description: 'Whether OAuth login is configured',
            resolve: ({ oauth }) => oauth,
          }),
          mailman: t.boolean({
            description: 'Whether Mailman automation is configured',
            authScopes: { admin: true, studentAssociationAdmin: true },
            resolve: ({ mailman }) => mailman,
          }),
          housekeeper: t.boolean({
            description: 'Whether the housekeeper is configured',
            authScopes: { admin: true },
            resolve: ({ housekeeper }) => housekeeper,
          }),
        }),
      }),
      resolve: ({ features }) => features,
    }),
  }),
});
