import SchemaBuilder, { type BuiltinScalarRef } from '@pothos/core';
import ComplexityPlugin from '@pothos/plugin-complexity';
import ErrorsPlugin from '@pothos/plugin-errors';
import PrismaPlugin from '@pothos/plugin-prisma';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import ValidationPlugin from '@pothos/plugin-validation';
import { GraphQLError, Kind } from 'graphql';
import { authScopes, type AuthContexts, type AuthScopes } from './auth.js';
import type { Context } from './context.js';
import type PrismaTypes from './prisma-types.js';
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
    ScopeAuthPlugin,
    SimpleObjectsPlugin,
    ValidationPlugin,
  ],
  authScopes,
  complexity: { limit: { complexity: 500, depth: 5, breadth: 30 } },
  defaultInputFieldRequiredness: true,
  errorOptions: { defaultTypes: [Error] },
  prisma: { client: prisma },
});

builder.queryType({});
builder.mutationType({});

// Parse GraphQL IDs as numbers
const id = (builder.configStore.getInputTypeRef('ID') as BuiltinScalarRef<number, string>).type;

id.parseValue = (value: unknown) => {
  const coerced = Number(value);
  if (Number.isNaN(coerced) || !Number.isFinite(coerced))
    throw new GraphQLError('Expected ID to be a numeric.');
  return coerced;
};

id.parseLiteral = (node) => {
  if (node.kind !== Kind.INT && node.kind !== Kind.STRING)
    throw new GraphQLError('Expected ID to be a numeric.');
  return id.parseValue(node.value);
};
