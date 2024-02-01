import { api } from './express.js';

api.get('/log', (req, res) => {
  console.info(req.query['message'] ?? '<empty>');
  res.send('ok');
});
