import { GraphQLYogaError } from "@graphql-yoga/node";
import { CredentialType as CredentialPrismaType } from "@prisma/client";
import argon2 from "argon2";
import { nanoid } from "nanoid";
import { builder } from "../builder.js";
import { prisma } from "../prisma.js";
import { DateTimeScalar } from "./scalars.js";

export const CredentialEnumType = builder.enumType(CredentialPrismaType, {
  name: "CredentialType",
});
/** All details about a credential except its value. */

export const CredentialType = builder.prismaObject("Credential", {
  fields: (t) => ({
    id: t.exposeID("id"),
    userId: t.exposeID("userId"),
    type: t.expose("type", { type: CredentialEnumType }),
    token: t.exposeString("value", { authScopes: { $granted: "login" } }),
    userAgent: t.exposeString("userAgent"),
    createdAt: t.expose("createdAt", { type: DateTimeScalar }),
    expiresAt: t.expose("expiresAt", { type: DateTimeScalar, nullable: true }),
    active: t.boolean({
      resolve: ({ type, value }, _, { token }) =>
        type === CredentialPrismaType.Token && value === token,
    }),
    user: t.relation("user", { grantScopes: ["me"] }),
  }),
});

/** Logs a user in and returns a session token. */
builder.mutationField("login", (t) =>
  t.prismaField({
    type: CredentialType,
    grantScopes: ["me", "login"],
    args: {
      name: t.arg.string(),
      password: t.arg.string(),
    },
    async resolve(query, _, { name, password }, { request }) {
      const credentials = await prisma.credential.findMany({
        where: { type: CredentialPrismaType.Password, user: { name } },
      });
      const userAgent = request.headers.get("User-Agent")?.slice(0, 255) ?? "";

      for (const { value, userId } of credentials) {
        if (await argon2.verify(value, password)) {
          return prisma.credential.create({
            ...query,
            data: {
              userId,
              type: CredentialPrismaType.Token,
              value: nanoid(),
              userAgent,
              // Keep the token alive for a year
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }

      throw new GraphQLYogaError("Invalid credentials.");
    },
  })
);

builder.mutationField("logout", (t) =>
  t.authField({
    type: "Boolean",
    authScopes: { loggedIn: true },
    resolve: async (_, {}, { token }) => {
      await prisma.credential.deleteMany({
        where: { type: CredentialPrismaType.Token, value: token },
      });
      return true;
    },
  })
);

/** Deletes a session. */
builder.mutationField("deleteSession", (t) =>
  t.field({
    type: "Boolean",
    args: { id: t.arg.id() },
    authScopes: async (_, { id }, { user }) => {
      const credential = await prisma.credential.findUniqueOrThrow({
        where: { id: Number(id) },
      });
      if (credential.type !== CredentialPrismaType.Token) return false;
      return user?.id === credential.userId;
    },
    resolve: async (_, { id }) => {
      await prisma.credential.delete({
        where: { id: Number(id) },
      });
      return true;
    },
  })
);
