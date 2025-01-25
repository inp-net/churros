import { builder, graphinx } from '#lib';
import * as Notella from '@inp-net/notella';

export type HealthCheck = {
  redis: { publish: boolean; subscribe: boolean };
  database: { prisma: boolean };
  ldap: { school: boolean | null; internal: boolean };
  mail: { smtp: boolean | null };
  notella: Notella.HealthResponse & { gateway: boolean };
  features: {
    prometheus: boolean;
    gitlab: boolean;
    googleAPIs: boolean;
    googleWallet: boolean;
    appleWallet: boolean;
    oauth: boolean;
    mailman: boolean;
    notifications: boolean;
    housekeeper: boolean;
  };
};

export const HealthCheckType = builder.objectRef<HealthCheck>('HealthCheck').implement({
  description: 'Results of a health self-check',
  fields: (t) => ({
    redis: t.field({
      resolve: ({ redis }) => redis,
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
    }),
    database: t.field({
      resolve: ({ database }) => database,
      type: builder.objectRef<HealthCheck['database']>('DatabaseHealthCheck').implement({
        ...graphinx('health-checks'),
        fields: (t) => ({
          prisma: t.boolean({
            resolve: ({ prisma }) => prisma,
          }),
        }),
      }),
    }),
    ldap: t.field({
      resolve: ({ ldap }) => ldap,
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
    }),
    mail: t.field({
      resolve: ({ mail }) => mail,
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
    }),
    notella: t.field({
      resolve: ({ notella }) => notella,
      type: builder.objectRef<HealthCheck['notella']>('NotellaHealthCheck').implement({
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
      resolve: ({ features }) => features,
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
          notifications: t.boolean({
            description: 'Whether notifications are configured',
            resolve: ({ notifications }) => notifications,
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
