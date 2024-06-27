import type { PothosTypes } from '#lib';
import { updateRateLimitHit, type Context } from '#lib';
import {
  defaultKeyGenerator,
  defaultOnLimit,
  rateLimitDirective,
} from 'graphql-rate-limit-directive';

export type RateLimitDirective = {
  locations: 'OBJECT' | 'FIELD_DEFINITION';
  args: {
    limit: number;
    duration: number;
  };
};

export const DEFAULT_RATE_LIMITS = {
  Query: {
    limit: 1200,
    duration: 60,
  },
  Mutation: {
    limit: 1200,
    duration: 10 * 60,
  },
  Subscription: {
    limit: 600,
    duration: 10 * 60,
  },
} as const;

export function setDefaultRateLimits(
  b: PothosSchemaTypes.SchemaBuilder<PothosSchemaTypes.ExtendDefaultTypes<PothosTypes>>,
) {
  b.queryType({
    directives: {
      rateLimit: DEFAULT_RATE_LIMITS.Query,
    },
  });

  b.mutationType({
    directives: {
      rateLimit: DEFAULT_RATE_LIMITS.Mutation,
    },
  });

  b.subscriptionType({
    directives: {
      rateLimit: DEFAULT_RATE_LIMITS.Subscription,
    },
  });
}

export const rateLimitDirectiveTransformer = rateLimitDirective({
  keyGenerator: (dargs, src, args, ctx: Context, info) => {
    return `${ctx.user?.uid}:${defaultKeyGenerator(dargs, src, args, ctx, info)}`;
  },
  async onLimit(response, dargs, src, args, ctx, info) {
    await updateRateLimitHit({
      queryName: info.fieldName,
      queryType: info.parentType.name,
      token: ctx.token,
      user: ctx.user?.id,
      tryAgainInMs: response.msBeforeNext,
    });
    defaultOnLimit(response, dargs, src, args, ctx, info);
  },
}).rateLimitDirectiveTransformer;
