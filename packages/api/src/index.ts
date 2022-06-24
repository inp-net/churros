import { createServer, YogaInitialContext } from "@graphql-yoga/node";
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import { PrismaClient } from "@prisma/client";
import type PrismaTypes from "./prisma-types.js";

const prisma = new PrismaClient({ log: ["query"], rejectOnNotFound: true });

const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: YogaInitialContext;
}>({ plugins: [PrismaPlugin], prisma: { client: prisma } });

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    clubs: t.relation("clubs"),
  }),
});

builder.prismaObject("Club", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    members: t.relation("members"),
  }),
});

builder.queryType({
  fields: (t) => ({
    users: t.prismaField({
      type: ["User"],
      resolve: (query) => prisma.user.findMany(query),
    }),
  }),
});

const server = createServer({ schema: builder.toSchema({}) });

process.env.DEBUG = "true";
server.start();
