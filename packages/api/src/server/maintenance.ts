import express from 'express';

export const maintenance = express();

maintenance.get('/', (_, res) => {
  console.info(`Hit maintenance page`);
  res.send(`<h1>Maintenance en cours</h1><p>On revient dès que possible!</p>`);
});

maintenance.get('/*', (_, res) => {
  res.redirect('/');
});
