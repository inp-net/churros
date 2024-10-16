import { Histogram } from 'prom-client';
import { PrometheusDriver } from 'prometheus-query';
import { ENV } from './env.js';

const queriesHistogram = new Histogram({
  name: 'query_duration_ms',
  help: 'Duration of queries',
  labelNames: ['query_type', 'oauth_client', 'user_id', 'query_name', 'operation_name'],
  buckets: [1, 5, 10, 30, 50, 100, 200, 500, 1000],
});

const rateLimitsHistogram = new Histogram({
  name: 'rate_limit_hit_penalty_ms',
  help: 'Duration of rate limit hits (time before trying again)',
  labelNames: ['query_type', 'oauth_client', 'user_id', 'query_name', 'operation_name'],
  buckets: [1, 5, 10, 30, 50, 100, 200, 500, 1000],
});

export async function updateQueryUsage({
  duration,
  queryName,
  queryType,
  user,
  operationName,
}: {
  queryType: string;
  queryName: string;
  token?: string;
  user?: string;
  duration: number;
  operationName?: string;
}) {
  queriesHistogram
    .labels({
      operation_name: operationName ?? '',
      query_name: queryName,
      query_type: queryType,
      user_id: user ?? '',
    })
    .observe(duration);
}

export async function updateRateLimitHit({
  queryName,
  queryType,
  user,
  tryAgainInMs,
  operationName,
}: {
  queryType: string;
  queryName: string;
  user?: string;
  tryAgainInMs: number;
  operationName?: string;
}) {
  rateLimitsHistogram
    .labels({
      query_name: queryName,
      query_type: queryType,
      user_id: user ?? '',
      operation_name: operationName ?? '',
    })
    .observe(tryAgainInMs);
}

export const prometheusClient = new PrometheusDriver({
  endpoint: ENV.PROMETHEUS_URL || 'http://localhost:9090',
  baseURL: '/api/v1',
});
