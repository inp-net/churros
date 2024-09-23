import { PrometheusDriver } from 'prometheus-query';

export const prometheusClient = new PrometheusDriver({
  endpoint: process.env.PROMETHEUS_URL || 'http://localhost:9090',
  baseURL: '/api/v1',
});
