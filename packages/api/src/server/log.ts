import { api } from './express.js';

console.info(`Serving logging endpoint on /log`);
api.get('/log', (req, res) => {
  console.info(req.query['message'] ?? '<empty>');
  res.send('ok');
});
