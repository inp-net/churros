import { builder, graphinx, nestedFields, subscribeClient } from '#lib';
import {
  checkFeatures,
  checkLdapClient,
  checkMailClient,
  checkNotella,
  checkPrismaClient,
  checkRedisClient,
  checkSchoolLdapClient,
  type FeaturesCheck,
  type NotellaHealthCheck,
} from '#modules/health-checks/utils';

export const HealthCheckType = builder.objectRef<void>('HealthCheck').implement({
  description: 'Health self-checks',
  fields: (t) => ({
    redis: nestedFields(t, 'health-checks', 'RedisHealthCheck', (t) => ({
      subscribe: t.boolean({
        description: 'Whether the Redis subscriber client is ready',
        resolve: async () => checkRedisClient(subscribeClient),
      }),
      publish: t.boolean({
        description: 'Whether the Redis publisher client is ready',
        resolve: async () => checkRedisClient(subscribeClient),
      }),
    })),
    database: nestedFields(t, 'health-checks', 'DatabaseHealthCheck', (t) => ({
      prisma: t.boolean({
        resolve: checkPrismaClient,
      }),
    })),
    ldap: nestedFields(t, 'health-checks', 'LdapHealthCheck', (t) => ({
      school: t.boolean({
        description:
          'Whether the LDAP school client is ready. Null when no LDAP_SCHOOL has been configured.',
        nullable: true,
        resolve: checkSchoolLdapClient,
      }),
      internal: t.boolean({
        description: 'Whether the LDAP internal client is ready',
        resolve: checkLdapClient,
      }),
    })),
    mail: nestedFields(t, 'health-checks', 'MailHealthCheck', (t) => ({
      smtp: t.boolean({
        description: 'Whether the SMTP client is ready. Null if no SMTP_URL is configured.',
        nullable: true,
        resolve: checkMailClient,
      }),
    })),
    notella: t.field({
      resolve: checkNotella,
      type: builder.objectRef<NotellaHealthCheck>('NotellaHealthCheck').implement({
        ...graphinx('health-checks'),
        fields: (t) => ({
          gateway: t.boolean({
            description: 'Whether Churros can access Notella at all',
            resolve: ({ gateway }) => gateway,
          }),
          churrosDatabase: t.boolean({
            description: "Whether Notella's connection to the Churros database is ready",
            resolve: ({ churros_db }) => churros_db,
          }),
          firebase: t.boolean({
            description: "Whether Notella's connection to Firebase is ready",
            resolve: ({ firebase }) => firebase,
          }),
          nats: t.boolean({
            description: "Whether Notella's connection to NATS is ready",
            resolve: ({ nats }) => nats,
          }),
          redis: t.boolean({
            description: "Whether Notella's connection to Redis is ready",
            resolve: ({ redis }) => redis,
          }),
        }),
      }),
    }),
    features: t.field({
      resolve: checkFeatures,
      type: builder.objectRef<FeaturesCheck>('FeaturesHealthCheck').implement({
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
          notifications: t.boolean({
            description: 'Whether notifications are configured',
            resolve: ({ notifications }) => notifications,
          }),
          housekeeper: t.boolean({
            description: 'Whether the housekeeper is configured',
            authScopes: { admin: true },
            resolve: ({ housekeeper }) => housekeeper,
          }),
        }),
      }),
    }),
  }),
});
