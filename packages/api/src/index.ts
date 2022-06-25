import {
  createServer,
  GraphQLYogaError,
  YogaInitialContext,
} from "@graphql-yoga/node";
import SchemaBuilder from "@pothos/core";
import ComplexityPlugin from "@pothos/plugin-complexity";
import PrismaPlugin from "@pothos/plugin-prisma";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import ValidationPlugin from "@pothos/plugin-validation";
import { CredentialType, PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { writeFile } from "fs/promises";
import { printSchema } from "graphql";
import { DateTimeResolver } from "graphql-scalars";
import { nanoid } from "nanoid";
import type PrismaTypes from "./prisma-types.js";

const prisma = new PrismaClient({ log: ["query"], rejectOnNotFound: true });

const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: YogaInitialContext & Awaited<ReturnType<typeof context>>;
  DefaultInputFieldRequiredness: true;
  Scalars: { DateTime: { Input: Date; Output: Date } };
  AuthScopes: { loggedIn: boolean };
}>({
  plugins: [ComplexityPlugin, PrismaPlugin, ScopeAuthPlugin, ValidationPlugin],
  prisma: { client: prisma },
  defaultInputFieldRequiredness: true,
  complexity: { limit: { complexity: 100, depth: 3, breadth: 30 } },
  authScopes: ({ user }) => ({
    loggedIn: Boolean(user),
  }),
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
      authScopes: { loggedIn: true },
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
          if (await argon2.verify(value, password)) {
            const { value: token } = await prisma.credential.create({
              data: { type: CredentialType.Token, value: nanoid(), userId },
            });
            return { token };
          }
        }

        throw new GraphQLYogaError("Incorrect credentials");
      },
    }),
    register: t.prismaField({
      type: "User",
      args: {
        name: t.arg.string({
          validate: {
            minLength: 3,
            maxLength: 20,
            regex: [/[a-z][a-z_.-]*/, { message: "Letters, -, _ and . only" }],
          },
        }),
        firstname: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
        lastname: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
        password: t.arg.string({ validate: { minLength: 10, maxLength: 255 } }),
      },
      async resolve(query, _, { name, firstname, lastname, password }) {
        return prisma.user.create({
          ...query,
          data: {
            name,
            firstname,
            lastname,
            credentials: {
              create: {
                type: CredentialType.Password,
                value: await argon2.hash(password, { type: argon2.argon2id }),
              },
            },
          },
        });
      },
    }),
  }),
});

const getUser = async ({ headers }: Request) => {
  const auth = headers.get("Authorization");
  if (!auth) return null;
  const token = auth.slice("Bearer ".length);
  console.log(token);
  return prisma.credential
    .findFirst({ where: { type: CredentialType.Token, value: token } })
    .user();
};

const context = async ({ request }: YogaInitialContext) => ({
  user: await getUser(request),
});

const schema = builder.toSchema({});
const server = createServer({ schema, context, maskedErrors: false });

process.env.DEBUG = "true";
await server.start();
await writeFile(
  new URL("schema.graphql", import.meta.url),
  printSchema(schema)
);
