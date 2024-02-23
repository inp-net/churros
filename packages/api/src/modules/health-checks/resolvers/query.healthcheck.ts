import {
  builder,
  connectLdap,
  prisma,
  publishClient,
  schoolLdapSettings,
  subscribeClient,
} from '#lib';

import ldap from 'ldapjs';
import { createTransport } from 'nodemailer';
import { HealthCheck } from '../index.js';
// TODO maybe rename to query.check-health ?
// TODO centralize the mailer object in #lib

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
