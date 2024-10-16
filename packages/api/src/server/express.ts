/* eslint-disable unicorn/prefer-module */
import { context, ENV } from '#lib';
import { checkHealth } from '#modules/health-checks/utils';
import cors from 'cors';
import { minutesToMilliseconds } from 'date-fns';
import express from 'express';
import * as GraphQLWS from 'graphql-ws/lib/use/ws';
import helmet from 'helmet';
import passport from 'passport';
import { setIntervalAsync } from 'set-interval-async';
import { WebSocketServer } from 'ws';
import { schema } from '../schema.js';
import session from './auth/session.js';

export const api = express();

// default passport strategy
import('./auth/anonymous.js');
import('./auth/bearer.js');

api.use(
  // Allow any origin, this is a public API :)
  cors({
    credentials: true,
    origin: true,
  }),
  // Set basic security headers
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
  // express-session middleware
  session,
  // Passport middleware
  passport.initialize(),
  passport.session(),
  passport.authenticate(['bearer', 'anonymous'], { session: false }),
);

export async function startApiServer() {
  // load passport strategies
  if (ENV.PUBLIC_OAUTH_ENABLED.trim() === '1') {
    import('./auth/oauth2.js');
    import('./auth/logout.js');
  }

  // Register other routes on the API
  try {
    import('./graphql.js');
  } catch (error) {
    console.error('Failed to initialize GraphQL server', error);
  }
  import('./gdpr.js');
  import('./log.js');
  import('./booking-pdf.js');
  import('./handover-pdf.js');
  import('./storage.js');

  // Perform a health check and setup interval to run health checks every 5 minutes
  console.info('Performing initial health check...');
  await checkHealth();
  console.info('Setting up health check interval...');
  setIntervalAsync(async () => {
    console.info('Performing health check...');
    await checkHealth();
  }, minutesToMilliseconds(5));

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
