import express from 'express';
import { register } from 'prom-client';

export const prometheusServer = express();

prometheusServer.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

prometheusServer.get('/metrics/:counter', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.getSingleMetricAsString(req.params.counter));
  } catch (error) {
    res.status(500).end(error);
  }
});
