import {
  createServer,
  GraphQLYogaError,
  YogaInitialContext,
} from "@graphql-yoga/node";
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import { CredentialType, PrismaClient } from "@prisma/client";
import { verify } from "argon2";
import { writeFile } from "fs/promises";
import { printSchema } from "graphql";
import { DateTimeResolver } from "graphql-scalars";
import { nanoid } from "nanoid";
import type PrismaTypes from "./prisma-types.js";

const prisma = new PrismaClient({ log: ["query"], rejectOnNotFound: true });

const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: YogaInitialContext;
  DefaultInputFieldRequiredness: true;
  Scalars: { DateTime: { Input: Date; Output: Date } };
}>({
  plugins: [PrismaPlugin],
  prisma: { client: prisma },
  defaultInputFieldRequiredness: true,
});

const UserType = builder.prismaObject("User", {
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

builder.addScalarType("DateTime", DateTimeResolver, {});

const Session = builder.objectType(
  builder.objectRef<{ token: string }>("Session"),
  {
    fields: (t) => ({
      token: t.exposeString("token"),
      user: t.field({
        type: UserType,
        async resolve({ token }) {
          const user = await prisma.credential
            .findFirst({ where: { type: CredentialType.Token, value: token } })
            .user();
          if (!user) throw new GraphQLYogaError("Session not found");
          return user;
        },
      }),
    }),
  }
);

builder.queryType({
  fields: (t) => ({
    users: t.prismaField({
      type: ["User"],
      resolve: (query) => prisma.user.findMany(query),
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    login: t.field({
      type: Session,
      args: {
        name: t.arg.string(),
        passord: t.arg.string(),
      },
      async resolve(_, { name, passord: password }) {
        const credentials = await prisma.credential.findMany({
          where: { type: CredentialType.Password, user: { name } },
        });

        for (const { value, userId } of credentials) {
          if (await verify(value, password)) {
            const { value: token } = await prisma.credential.create({
              data: { type: CredentialType.Token, value: nanoid(), userId },
            });
            return { token };
          }
        }

        throw new GraphQLYogaError("Incorrect credentials ");
      },
    }),
  }),
});

const schema = builder.toSchema({});
const server = createServer({ schema });

process.env.DEBUG = "true";
await server.start();
await writeFile(
  new URL("schema.graphql", import.meta.url),
  printSchema(schema)
);
