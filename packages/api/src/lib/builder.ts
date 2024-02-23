import type { Context } from '#lib';
import {
  authScopes,
  decodeGlobalID,
  encodeGlobalID,
  type AuthContexts,
  type AuthScopes,
} from '#lib';
import SchemaBuilder, { type BuiltinScalarRef } from '@pothos/core';
import ComplexityPlugin from '@pothos/plugin-complexity';
import DataloaderPlugin from '@pothos/plugin-dataloader';
import DirectivePlugin from '@pothos/plugin-directives';
import ErrorsPlugin from '@pothos/plugin-errors';
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import RelayPlugin from '@pothos/plugin-relay';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import SmartSubscriptionsPlugin, {
  subscribeOptionsFromIterator,
} from '@pothos/plugin-smart-subscriptions';
import TracingPlugin, { isRootField, wrapResolver } from '@pothos/plugin-tracing';
import ValidationPlugin from '@pothos/plugin-validation';
import { GraphQLError, Kind } from 'graphql';
import { prisma } from './prisma.js';
import { pubsub } from './pubsub.js';

export const builder = new SchemaBuilder<{
  AuthContexts: AuthContexts;
  AuthScopes: AuthScopes;
  Context: Context;
  DefaultInputFieldRequiredness: true;
  PrismaTypes: PrismaTypes;
  Scalars: {
    DateTime: { Input: Date; Output: Date };
    File: { Input: never; Output: File };
    ID: { Input: string; Output: string };
    Counts: { Input: Record<string, number>; Output: Record<string, number> };
    BooleanMap: { Input: Record<string, boolean>; Output: Record<string, boolean> };
  };
  Directives: {
    rateLimit: {
      locations: 'OBJECT' | 'FIELD_DEFINITION';
      args: { limit: number; duration: number };
    };
  };
}>({
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
  ],
  authScopes,
  complexity: { limit: { complexity: 30_000, depth: 7, breadth: 200 } },
  defaultInputFieldRequiredness: true,
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
  },
  tracing: {
    default: (config) => isRootField(config),
    wrap: (resolver, _options, config) =>
      wrapResolver(resolver, (_error, duration) => {
        console.info(
          `Executed \u001B[36;1m${config.parentType}.${
            config.name
          }\u001B[0m in \u001B[36;1m${Number(duration.toPrecision(3))} ms\u001B[0m`,
        );
      }),
  },
  smartSubscriptions: {
    ...subscribeOptionsFromIterator((name) => {
      console.info(`Subscribing to ${name}`);
      return pubsub.subscribe(name);
    }),
  },
});

// The frontend can sometimes make bursts of requests, so we add a grace window to the rate limits to prevent failures. Real attacks attempt DDOS for longer than this grace window, so it should be safe.
const rateLimitGraceWindow = 30; /* seconds */
const rateLimit = (limit: number, duration: number) => ({
  rateLimit: { limit: limit * rateLimitGraceWindow, duration: duration * rateLimitGraceWindow },
});

builder.queryType({
  directives: {
    ...rateLimit(3, 1),
  },
});

builder.mutationType({
  directives: {
    ...rateLimit(5, 10),
  },
});

builder.subscriptionType({
  directives: {
    ...rateLimit(10, 30),
  },
});

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
