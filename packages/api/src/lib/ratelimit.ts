import type { PothosTypes } from '#lib';
import { updateRateLimitHit, type Context } from '#lib';
import { MapperKind, getDirective, mapSchema, type Maybe } from '@graphql-tools/utils';
import { formatDuration, intervalToDuration, type Locale } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';
import { GraphQLError, GraphQLObjectType, type GraphQLSchema } from 'graphql';
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

export function rateLimitDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema {
  const { rateLimitDirectiveTransformer: transformer } = rateLimitDirective({
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
      try {
        defaultOnLimit(response, dargs, src, args, ctx, info);
      } catch (error) {
        const error_ =
          error instanceof GraphQLError
            ? new GraphQLError(
                `Trop de requêtes. Réésaye dans ${formatDuration(intervalToDuration({ start: 0, end: response.msBeforeNext }), { locale: fr })}`,
              )
            : error;
        throw error_;
      }
    },
  });

  // Auto-generate additional documentation to mention rate limits
  return mapSchema(transformer(schema), {
    [MapperKind.OBJECT_TYPE]: (type, schema) => {
      const rateLimitDirective = getDirective(schema, type, 'rateLimit')?.[0] as
        | RateLimitDirective['args']
        | undefined;

      if (!rateLimitDirective) return type;
      return new GraphQLObjectType({
        ...type.toConfig(),
        description: appendRateLimitToDescription(type.description, rateLimitDirective),
      });
    },

    [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, _typeName, schema) => {
      const rateLimitDirective = getDirective(schema, fieldConfig, 'rateLimit')?.[0] as
        | RateLimitDirective['args']
        | undefined;

      if (!rateLimitDirective) return fieldConfig;
      return {
        ...fieldConfig,
        description: appendRateLimitToDescription(fieldConfig.description, rateLimitDirective),
      };
    },
  });
}

function appendRateLimitToDescription(
  description: Maybe<string>,
  directive: RateLimitDirective['args'],
): string {
  return (
    (description ? description + '\n\n' : '') + `- **Rate limit:** ${formatRateLimit(directive)}`
  );
}

export function formatRateLimit({ limit, duration }: RateLimitDirective['args'], locale?: Locale) {
  const durationObject = intervalToDuration({ start: 0, end: duration * 1000 });
  let durationString = formatDuration(durationObject, { locale: locale ?? fr });

  // remove leading "1 " if there's only one unit to turn e.g. "60/1 minute" into "60/minute"
  if (
    Object.values(durationObject).filter((v) => v > 0).length === 1 &&
    Object.values(durationObject).includes(1)
  )
    durationString = durationString.replace(/^1 /, '');

  if (durationString.includes(' ')) return `${limit} / ${durationString}`;
  return `${limit}/${durationString}`;
}
