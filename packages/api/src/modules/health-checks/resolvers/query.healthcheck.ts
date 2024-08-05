import { builder } from '#lib';
import { checkHealth, HealthCheckType } from '../index.js';

// TODO maybe rename to query.check-health ?
builder.queryField('healthcheck', (t) =>
  t.field({
    type: HealthCheckType,
    directives: {
      rateLimit: {
        duration: 1,
        limit: 5,
      },
    },
    resolve: checkHealth,
  }),
);
