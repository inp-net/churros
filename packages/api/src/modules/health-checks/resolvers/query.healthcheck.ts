import { builder } from '#lib';
import { HealthCheckType } from '../index.js';

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
    // Resolvers are in the types themselves, and reference functions defined in ../utils/checks.ts
    // @ts-expect-error - the builder of the type says it has void has a backing data type, but using void 0 here makes the field return null immediately
    resolve: () => ({}),
  }),
);
