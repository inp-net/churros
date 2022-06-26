import SchemaBuilder from "@pothos/core";
import ComplexityPlugin from "@pothos/plugin-complexity";
import PrismaPlugin from "@pothos/plugin-prisma";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import ValidationPlugin from "@pothos/plugin-validation";
import { AuthContexts, AuthScopes, authScopes } from "./auth.js";
import type { Context } from "./context.js";
import type PrismaTypes from "./prisma-types.js";
import { prisma } from "./prisma.js";

export const builder = new SchemaBuilder<{
  AuthContexts: AuthContexts;
  AuthScopes: AuthScopes;
  Context: Context;
  DefaultInputFieldRequiredness: true;
  PrismaTypes: PrismaTypes;
  Scalars: {
    DateTime: { Input: Date; Output: Date };
  };
}>({
  plugins: [
    ComplexityPlugin,
    PrismaPlugin,
    ScopeAuthPlugin,
    SimpleObjectsPlugin,
    ValidationPlugin,
  ],
  authScopes,
  complexity: { limit: { complexity: 500, depth: 4, breadth: 30 } },
  defaultInputFieldRequiredness: true,
  prisma: { client: prisma },
});

builder.queryType({});
builder.mutationType({});
