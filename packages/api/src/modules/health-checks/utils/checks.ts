import { ENV, prisma, publishClient, schoolLdapSettings, subscribeClient } from '#lib';
import { Client } from '@inp-net/ldap7';
import ldap from 'ldapjs';
import { createTransport } from 'nodemailer';
import type { HealthCheck } from '../types/index.js';

const SMTP_URL = ENV.SMTP_URL;

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
    smtp: SMTP_URL
      ? await createTransport(SMTP_URL)
          .verify()
          .then(() => true)
          .catch(() => false)
      : null,
  },
  ldap: {
    internal: await new Promise<boolean>((resolve) => {
      const client = Client.getInstance('pretty');

      if (!client.client) {
        client
          .setup(
            {
              url: ENV.LDAP_URL,
            },
            ENV.LDAP_BIND_DN,
            ENV.LDAP_BIND_PASSWORD,
            ENV.LDAP_BASE_DN,
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
    school: schoolLdapSettings
      ? (
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
          .every(Boolean)
      : null,
  },
  features: {
    prometheus: Boolean(ENV.PROMETHEUS_URL),
    gitlab: Boolean(ENV.GITLAB_SUDO_TOKEN && ENV.GITLAB_PROJECT_ID),
    masterPassword: Boolean(ENV.MASTER_PASSWORD_HASH),
    googleAPIs: Boolean(ENV.PUBLIC_GOOGLE_CLIENT_ID && ENV.GOOGLE_CLIENT_SECRET),
    googleWallet: Boolean(ENV.PUBLIC_GOOGLE_WALLET_ISSUER_ID && ENV.GOOGLE_WALLET_ISSUER_KEY),
    appleWallet: Boolean(ENV.PUBLIC_GOOGLE_WALLET_ISSUER_ID && ENV.GOOGLE_WALLET_ISSUER_KEY),
    oauth: Boolean(
      ENV.PUBLIC_OAUTH_AUTHORIZE_URL &&
        ENV.PUBLIC_OAUTH_TOKEN_URL &&
        ENV.PUBLIC_OAUTH_CLIENT_ID &&
        ENV.OAUTH_CLIENT_SECRET &&
        ENV.PUBLIC_OAUTH_SCOPES,
    ),
    mailman: Boolean(ENV.MAILMAN_API_URL && ENV.MAILMAN_API_TOKEN),
  },
});
