import SchemaBuilder, { type BuiltinScalarRef } from '@pothos/core';
import ComplexityPlugin from '@pothos/plugin-complexity';
import ErrorsPlugin from '@pothos/plugin-errors';
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import RelayPlugin from '@pothos/plugin-relay';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import TracingPlugin, { isRootField, wrapResolver } from '@pothos/plugin-tracing';
import ValidationPlugin from '@pothos/plugin-validation';
import { GraphQLError, Kind } from 'graphql';
import { authScopes, type AuthContexts, type AuthScopes } from './auth.js';
import type { Context } from './context.js';
import { prisma } from './prisma.js';

export const builder = new SchemaBuilder<{
  AuthContexts: AuthContexts;
  AuthScopes: AuthScopes;
  Context: Context;
  DefaultInputFieldRequiredness: true;
  PrismaTypes: PrismaTypes;
  Scalars: {
    DateTime: { Input: Date; Output: Date };
    File: { Input: never; Output: File };
    ID: { Input: number; Output: number };
  };
}>({
  plugins: [
    ComplexityPlugin,
    ErrorsPlugin,
    PrismaPlugin,
    RelayPlugin,
    ScopeAuthPlugin,
    SimpleObjectsPlugin,
    TracingPlugin,
    ValidationPlugin,
  ],
  authScopes,
  complexity: { limit: { complexity: 500, depth: 6, breadth: 30 } },
  defaultInputFieldRequiredness: true,
  errorOptions: { defaultTypes: [Error] },
  prisma: { client: prisma },
  relayOptions: { clientMutationId: 'omit', cursorType: 'String' },
  tracing: {
    default: (config) => isRootField(config),
    wrap: (resolver, _options, config) =>
      wrapResolver(resolver, (_error, duration) => {
        console.log(
          `Executed \u001B[36;1m${config.parentType}.${
            config.name
          }\u001B[0m in \u001B[36;1m${Number(duration.toPrecision(3))} ms\u001B[0m`
        );
      }),
  },
});

builder.queryType({});
builder.mutationType({});

// Parse GraphQL IDs as numbers
const id = (builder.configStore.getInputTypeRef('ID') as BuiltinScalarRef<number, string>).type;

id.parseValue = (value: unknown) => {
  const coerced = Number(value);
  if (Number.isNaN(coerced) || !Number.isFinite(coerced)) return value;
  // throw new GraphQLError('Expected ID to be a numeric.');
  return coerced;
};

id.parseLiteral = (node) => {
  if (node.kind !== Kind.INT && node.kind !== Kind.STRING)
    throw new GraphQLError('Expected ID to be a numeric.');
  return id.parseValue(node.value);
};
