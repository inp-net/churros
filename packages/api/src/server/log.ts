import { log } from '#lib';
import { api } from './express.js';

console.info(`Serving logging endpoint on /log`);
api.get('/log', async (req, res) => {
  const message = req.query['message'] ?? '<empty>';
  await log('clientside', 'log', { message }, null, req.user?.user);
  res.send('ok');
});
