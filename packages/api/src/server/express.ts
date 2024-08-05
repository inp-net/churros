/* eslint-disable unicorn/prefer-module */
import { context } from '#lib';
import { checkHealth } from '#modules/health-checks';
import cors from 'cors';
import express from 'express';
import * as GraphQLWS from 'graphql-ws/lib/use/ws';
import helmet from 'helmet';
import { setIntervalAsync } from 'set-interval-async';
import { WebSocketServer } from 'ws';
import { schema } from '../schema.js';

export const api = express();

api.use(
  // Allow queries from the frontend only
  // cors({ origin: ['http://192.168.*', process.env.FRONTEND_ORIGIN, 'http://app'] }),
  cors(),
  // Set basic security headers
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

export async function startApiServer() {
  // Register other routes on the API
  import('./graphql.js');
  import('./gdpr.js');
  import('./log.js');
  import('./oauth.js');
  import('./booking-pdf.js');
  import('./handover-pdf.js');
  import('./storage.js');

  // Perform an health check and setup interval to run health checks every 5 minutes
  console.info('Performing initial health check...');
  await checkHealth();
  console.info('Setting up health check interval...');
  setIntervalAsync(async () => {
    await checkHealth();
  }, 300); // 5 minutes

  const apiServer = api.listen(4000, () => {
    console.info('API ready at http://localhost:4000');
    const apiWebsocket = new WebSocketServer({
      server: apiServer,
      path: '/graphql',
    });

    GraphQLWS.useServer({ schema, context }, apiWebsocket);
    console.info('Websocket ready at ws://localhost:4000');
  });
}
