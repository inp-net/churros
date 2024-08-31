import { api } from './express.js';

// Poor man's GDPR data download
console.info(`Serving GDPR data requests on /dump`);
api.use('/dump', async (_req, res) => {
  res.status(404).send('Log into the app and go to /gdpr');
});
