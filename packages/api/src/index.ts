import { createServer } from "@graphql-yoga/node";
import SchemaBuilder from "@pothos/core";

const builder = new SchemaBuilder({});

builder.queryType({
  fields: (t) => ({
    hello: t.string({
      args: {
        name: t.arg.string(),
      },
      resolve: (parent, { name }) => `hello, ${name || "World"}`,
    }),
  }),
});

const schema = builder.toSchema({});

const server = createServer({
  schema: builder.toSchema({}),
});

server.start();
