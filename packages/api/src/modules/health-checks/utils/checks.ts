import { ENV, prisma, publishClient, schoolLdapSettings, subscribeClient } from '#lib';
import { Client } from '@inp-net/ldap7';
import * as Notella from '@inp-net/notella';
import type Redis from 'ioredis';
import ldap from 'ldapjs';
import { createTransport } from 'nodemailer';

export async function checkEverything() {
  return {
    redis: {
      publish: await checkRedisClient(publishClient),
      subscribe: await checkRedisClient(subscribeClient),
    },
    database: {
      prisma: await checkPrismaClient(),
    },
    mail: {
      smtp: await checkMailClient(),
    },
    ldap: {
      internal: await checkLdapClient(),
      school: await checkSchoolLdapClient(),
    },
    notella: await checkNotella(),
    features: await checkFeatures(),
  };
}

export type NotellaHealthCheck = Notella.HealthResponse & { gateway: boolean };
export async function checkNotella(): Promise<NotellaHealthCheck> {
  try {
    if (!ENV.NOTELLA_HEALTHCHECK_ENDPOINT) throw new Error('No endpoint');
    const res = await fetch(ENV.NOTELLA_HEALTHCHECK_ENDPOINT);
    const data = (await res.json()) as Notella.HealthResponse;
    return {
      gateway: true,
      ...data,
    };
  } catch {
    return {
      gateway: false,
      churros_db: false,
      firebase: false,
      nats: false,
      redis: false,
    };
  }
}

export type FeaturesCheck = {
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

export async function checkFeatures(): Promise<FeaturesCheck> {
  return {
    prometheus: Boolean(ENV.PROMETHEUS_URL),
    gitlab: Boolean(ENV.GITLAB_SUDO_TOKEN && ENV.GITLAB_PROJECT_ID),
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
    notifications: Boolean(ENV.NOTELLA_HEALTHCHECK_ENDPOINT && ENV.NOTELLA_NATS_URL),
    housekeeper: Boolean(ENV.HOUSEKEEPER_TOKEN),
  };
}

export async function checkRedisClient(client: Redis.Redis) {
  return client
    .ping()
    .then((d) => d === 'PONG' || (Array.isArray(d) && d[0] === 'pong'))
    .catch(() => false);
}

export async function checkPrismaClient() {
  return prisma
    .$connect()
    .then(() => true)
    .catch(() => false);
}

export async function checkMailClient() {
  if (!ENV.SMTP_URL) return null;

  return createTransport(ENV.SMTP_URL)
    .verify()
    .then(() => true)
    .catch(() => false);
}

export async function checkLdapClient() {
  const client = Client.getInstance('pretty');

  if (!client.client) {
    return client
      .setup(
        {
          url: ENV.LDAP_URL,
        },
        ENV.LDAP_BIND_DN,
        ENV.LDAP_BIND_PASSWORD,
        ENV.LDAP_BASE_DN,
      )
      .then(() => true)
      .catch(() => false);
  }

  if (client.client.isConnected) return true;

  return client
    .connect()
    .then(() => true)
    .catch(() => false);
}

export async function checkSchoolLdapClient() {
  if (!schoolLdapSettings) return null;

  return Promise.all(
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
  ).then((d) => d.every(Boolean));
}
