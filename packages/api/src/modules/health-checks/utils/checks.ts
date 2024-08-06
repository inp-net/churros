import { Client } from '@inp-net/ldap7';
import ldap from 'ldapjs';
import { createTransport } from 'nodemailer';
import { prisma, publishClient, schoolLdapSettings, subscribeClient } from '../../../lib/index.js';
import type { HealthCheck } from '../types/index.js';

export const checkHealth = async (): Promise<HealthCheck> => ({
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
    smtp: await createTransport(process.env.SMTP_URL)
      .verify()
      .then(() => true)
      .catch(() => false),
  },
  ldap: {
    internal: await new Promise<boolean>((resolve) => {
      const client = Client.getInstance('pretty');

      if (!client.client) {
        client
          .setup(
            {
              url: process.env.LDAP_URL,
            },
            process.env.LDAP_BIND_DN,
            process.env.LDAP_BIND_PASSWORD,
            process.env.LDAP_BASE_DN,
          )
          .catch(() => resolve(false))
          .then(() => resolve(true));
        return;
      }

      if (client.client.isConnected) {
        resolve(true);
        return;
      }

      client
        .connect()
        .then(() => resolve(true))
        .catch(() => resolve(false));

      setTimeout(() => resolve(false), 1000);
    }),
    school: (
      await Promise.all(
        Object.values(schoolLdapSettings.servers).map(
          (server) =>
            new Promise((resolve) => {
              try {
                const c = ldap.createClient({ url: server.url });
                c.on('error', () => resolve(false));
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
});
