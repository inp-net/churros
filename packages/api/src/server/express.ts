/* eslint-disable unicorn/prefer-module */
import { context } from '#lib';
import cors from 'cors';
import express from 'express';
import * as GraphQLWS from 'graphql-ws/lib/use/ws';
import helmet from 'helmet';
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

export function startApiServer() {
  // Register other routes on the API
  import('./graphql.js');
  import('./gdpr.js');
  import('./log.js');
  import('./oauth.js');
  import('./pdf.js');
  import('./storage.js');

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
