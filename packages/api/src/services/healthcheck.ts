import { builder, prisma, publishClient, subscribeClient } from '#lib';
import ldap from 'ldapjs';
import { createTransport } from 'nodemailer';
import { settings as schoolLdapSettings } from './ldap-school.js';
import { connectLdap } from './ldap.js';

type HealthCheck = {
  redis: { publish: boolean; subscribe: boolean };
  database: { prisma: boolean };
  ldap: { school: boolean; internal: boolean };
  mail: { smtp: boolean };
};

export const HealthCheck = builder.objectRef<HealthCheck>('HealthCheck').implement({
  description: 'Results of a health self-check',
  fields: (t) => ({
    redis: t.field({
      type: builder.objectRef<HealthCheck['redis']>('RedisHealthCheck').implement({
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
        fields: (t) => ({
          school: t.boolean({
            description: 'Whether the LDAP school client is ready',
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
        fields: (t) => ({
          smtp: t.boolean({
            description: 'Whether the SMTP client is ready',
            resolve: ({ smtp }) => smtp,
          }),
        }),
      }),
      resolve: ({ mail }) => mail,
    }),
  }),
});

builder.queryField('healthcheck', (t) =>
  t.field({
    type: HealthCheck,
    directives: {
      rateLimit: {
        duration: 1,
        limit: 5,
      },
    },
    async resolve() {
      return {
        redis: {
          publish: await publishClient
            .ping()
            .then((d) => d === 'PONG' || (Array.isArray(d) && d[0] === 'pong'))
            .catch(() => false),
          subscribe: await subscribeClient
            .ping()
            .then((d) => d === 'PONG' || (Array.isArray(d) && d[0] === 'pong'))
            .catch(() => false),
        },
        database: {
          prisma: await prisma
            .$connect()
            .then(() => true)
            .catch(() => false),
        },
        mail: {
          smtp: await new Promise<boolean>((resolve) => {
            try {
              createTransport(process.env.SMTP_URL).verify();
              resolve(true);
            } catch (error) {
              console.error(error);
              resolve(false);
            }
          }),
        },
        ldap: {
          internal:
            process.env['NODE_ENV'] === 'development'
              ? true
              : await new Promise<boolean>((resolve) => {
                  try {
                    const c = connectLdap();
                    c.bind(process.env.LDAP_BASE_DN, process.env.LDAP_BIND_PASSWORD, (err) => {
                      if (err) resolve(false);
                      resolve(true);
                    });
                  } catch {
                    resolve(true);
                  }
                }),
          school: (
            await Promise.all(
              Object.values(schoolLdapSettings.servers).map(
                (server) =>
                  new Promise((resolve) => {
                    try {
                      const c = ldap.createClient({ url: server.url });
                      c.bind('', '', (err) => {
                        if (err) resolve(false);
                        resolve(true);
                      });
                    } catch {
                      resolve(false);
                    }
                  }),
              ),
            )
          )
            // eslint-disable-next-line unicorn/no-await-expression-member
            .every(Boolean),
        },
      };
    },
  }),
);
