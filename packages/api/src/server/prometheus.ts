import { register } from 'prom-client';
import { api } from './express.js';

api.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

api.get('/metrics/:counter', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.getSingleMetricAsString(req.params.counter));
  } catch (error) {
    res.status(500).end(error);
  }
});
