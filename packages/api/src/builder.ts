import { YogaInitialContext } from "@graphql-yoga/node";
import SchemaBuilder from "@pothos/core";
import ComplexityPlugin from "@pothos/plugin-complexity";
import PrismaPlugin from "@pothos/plugin-prisma";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import ValidationPlugin from "@pothos/plugin-validation";
import type { context } from "./context.js";
import type PrismaTypes from "./prisma-types.js";
import { prisma } from "./prisma.js";

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: YogaInitialContext & Awaited<ReturnType<typeof context>>;
  DefaultInputFieldRequiredness: true;
  Scalars: { DateTime: { Input: Date; Output: Date } };
  AuthScopes: { loggedIn: boolean };
}>({
  plugins: [
    ComplexityPlugin,
    PrismaPlugin,
    ScopeAuthPlugin,
    SimpleObjectsPlugin,
    ValidationPlugin,
  ],
  prisma: { client: prisma },
  defaultInputFieldRequiredness: true,
  complexity: { limit: { complexity: 100, depth: 3, breadth: 30 } },
  authScopes: ({ user }) => ({
    loggedIn: Boolean(user),
  }),
});

builder.queryType({});
builder.mutationType({});
