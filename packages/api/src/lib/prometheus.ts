import { Counter, Histogram } from 'prom-client';
import { PrometheusDriver } from 'prometheus-query';
import { prisma } from './prisma.js';

const queriesHistogram = new Histogram({
  name: 'query_duration_ms',
  help: 'Duration of queries',
  labelNames: ['query_type', 'oauth_client', 'user_id', 'query_name'],
  buckets: [1, 5, 10, 30, 50, 100, 200, 500, 1000],
});

const rateLimitsHistogram = new Histogram({
  name: 'rate_limit_hit_penalty_ms',
  help: 'Duration of rate limit hits (time before trying again)',
  labelNames: ['query_type', 'oauth_client', 'user_id', 'query_name'],
  buckets: [1, 5, 10, 30, 50, 100, 200, 500, 1000],
});

const createdTokens = new Counter({
  name: 'tokens_created',
  help: 'Number of created tokens',
  labelNames: ['oauth_client', 'user_id'],
});

export async function updateQueryUsage({
  duration,
  queryName,
  queryType,
  token,
  user,
}: {
  queryType: string;
  queryName: string;
  token: string | undefined;
  user: string | undefined;
  duration: number;
}) {
  const app = token
    ? await prisma.thirdPartyCredential.findFirst({
        where: { value: token },
      })
    : undefined;

  queriesHistogram
    .labels({
      query_name: queryName,
      query_type: queryType,
      oauth_client: app?.clientId ?? '',
      user_id: user ?? '',
    })
    .observe(duration);
}

export async function updateRateLimitHit({
  token,
  queryName,
  queryType,
  user,
  tryAgainInMs,
}: {
  queryType: string;
  queryName: string;
  token: string | undefined;
  user: string | undefined;
  tryAgainInMs: number;
}) {
  const app = token
    ? await prisma.thirdPartyCredential.findFirst({ where: { value: token } })
    : undefined;

  rateLimitsHistogram
    .labels({
      query_name: queryName,
      query_type: queryType,
      oauth_client: app?.clientId ?? '',
      user_id: user ?? '',
    })
    .observe(tryAgainInMs);
}

export async function updateCreatedTokensCount({ token, user }: { token: string; user: string }) {
  const app = await prisma.thirdPartyCredential.findFirst({ where: { value: token } });

  createdTokens
    .labels({
      oauth_client: app?.clientId ?? '',
      user_id: user,
    })
    .inc();
}

export const prometheusClient = new PrometheusDriver({
  endpoint: process.env.PROMETHEUS_URL,
  baseURL: '/api/v1',
});
