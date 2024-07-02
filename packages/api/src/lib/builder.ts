import type { Context, RateLimitDirective } from '#lib';
import {
  authScopes,
  context,
  decodeGlobalID,
  encodeGlobalID,
  type AuthContexts,
  type AuthScopes,
} from '#lib';
import type PrismaTypes from '@churros/db/pothos';
import SchemaBuilder, { type BuiltinScalarRef } from '@pothos/core';
import ComplexityPlugin from '@pothos/plugin-complexity';
import DataloaderPlugin from '@pothos/plugin-dataloader';
import DirectivePlugin from '@pothos/plugin-directives';
import ErrorsPlugin from '@pothos/plugin-errors';
import PrismaPlugin from '@pothos/plugin-prisma';
import RelayPlugin from '@pothos/plugin-relay';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import SmartSubscriptionsPlugin, {
  subscribeOptionsFromIterator,
} from '@pothos/plugin-smart-subscriptions';
import TracingPlugin, { isRootField, runFunction } from '@pothos/plugin-tracing';
import ValidationPlugin from '@pothos/plugin-validation';
import WithInputPlugin from '@pothos/plugin-with-input';
import { GraphQLError, Kind } from 'graphql';
import { default as parseUserAgent } from 'ua-parser-js';
import { prisma } from './prisma.js';
import { updateQueryUsage } from './prometheus.js';
import { pubsub } from './pubsub.js';
import { setDefaultRateLimits } from './ratelimit.js';

export interface PothosTypes {
  AuthContexts: AuthContexts;
  AuthScopes: AuthScopes;
  Context: Context;
  DefaultInputFieldRequiredness: true;
  PrismaTypes: PrismaTypes;
  DefaultEdgesNullability: false;
  DefaultNodeNullability: false;
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    File: {
      Input: never;
      Output: File;
    };
    ID: {
      Input: string;
      Output: string;
    };
    Counts: {
      Input: Record<string, number>;
      Output: Record<string, number>;
    };
    BooleanMap: {
      Input: Record<string, boolean>;
      Output: Record<string, boolean>;
    };
    UID: {
      Input: string;
      Output: string;
    };
  };
  Directives: {
    rateLimit: RateLimitDirective;
  };
}

export const builder = new SchemaBuilder<PothosTypes>({
  plugins: [
    ComplexityPlugin,
    DataloaderPlugin,
    ErrorsPlugin,
    PrismaPlugin,
    RelayPlugin,
    ScopeAuthPlugin,
    SimpleObjectsPlugin,
    TracingPlugin,
    ValidationPlugin,
    SmartSubscriptionsPlugin,
    DirectivePlugin,
    WithInputPlugin,
  ],
  authScopes,
  complexity: { limit: { complexity: 50_000, depth: 10, breadth: 200 } },
  defaultInputFieldRequiredness: true,
  withInput: {},
  errorOptions: { defaultTypes: [Error] },
  prisma: { client: prisma, exposeDescriptions: true },
  scopeAuthOptions: {
    unauthorizedError: () => new GraphQLError("Tu n'es pas autorisé à effectuer cette action."),
  },
  relayOptions: {
    clientMutationId: 'omit',
    cursorType: 'String',
    encodeGlobalID,
    decodeGlobalID,
    nodesOnConnection: true,
    nodeQueryOptions: false,
    nodesQueryOptions: false,
    edgesFieldOptions: {
      nullable: false,
    },
    nodeFieldOptions: {
      nullable: false,
    },
  },
  tracing: {
    default: (config) => isRootField(config),
    wrap: (resolver, _options, config) => async (source, args, ctx, info) => {
      return runFunction(
        () => resolver(source, args, ctx, info),
        (_error, duration) => {
          console.info(
            `Executed \u001B[36;1m${config.parentType}.${
              config.name
            }\u001B[0m in \u001B[36;1m${Number(duration.toPrecision(3))} ms\u001B[0m`,
          );
          // Do not wait for prometheus counters before sending the response!
          (async () => {
            const { token, user } = await context(ctx);
            const ua = parseUserAgent(ctx.request?.headers.get('User-Agent') ?? '');
            const ip = ctx.request?.headers.get('X-Real-Ip');

            updateQueryUsage({
              operationName: ctx.params?.operationName,
              queryType: config.parentType,
              queryName: config.name,
              token,
              user:
                user?.id ||
                (ua.browser.name ? `${ua.browser.name}/${ua.browser.version || '?'}` : ua.ua) +
                  (ip ? ` @${ip}` : ''),
              duration,
            }).catch(console.error);
          })();
        },
      );
    },
  },
  smartSubscriptions: {
    ...subscribeOptionsFromIterator((name) => {
      console.info(`Subscribing to ${name}`);
      return pubsub.subscribe(name);
    }),
  },
});

setDefaultRateLimits(builder);

// Parse GraphQL IDs as strings
const id = (builder.configStore.getInputTypeRef('ID') as BuiltinScalarRef<string, string>).type;

id.parseValue = (value: unknown) => {
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') return value;
  throw new GraphQLError('Expected ID to be a number or a string.');
};

id.parseLiteral = (node) => {
  if (node.kind !== Kind.INT && node.kind !== Kind.STRING)
    throw new GraphQLError('Expected ID to be a numeric.');
  return id.parseValue(node.value);
};
