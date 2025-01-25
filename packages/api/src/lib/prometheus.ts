import { PrometheusDriver } from 'prometheus-query';
import { ENV } from './env.js';

export const prometheusClient = new PrometheusDriver({
  endpoint: ENV.PROMETHEUS_URL || 'http://localhost:9090',
  baseURL: '/api/v1',
});
