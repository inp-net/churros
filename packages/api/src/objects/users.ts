import { GraphQLYogaError } from "@graphql-yoga/node";
import { CredentialType as CredentialPrismaType } from "@prisma/client";
import argon2 from "argon2";
import { nanoid } from "nanoid";
import { builder } from "../builder.js";
import { prisma } from "../prisma.js";
import { DateTimeScalar } from "./scalars.js";

/** Represents a user, mapped on the underlying database object. */
export const UserType = builder.prismaObject("User", {
  grantScopes: ({ id }, { user }) => (user?.id === id ? ["me"] : []),
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    firstname: t.exposeString("firstname"),
    nickname: t.exposeString("nickname"),
    lastname: t.exposeString("lastname"),
    createdAt: t.expose("createdAt", { type: DateTimeScalar }),

    // Permissions are only visible to admins
    admin: t.exposeBoolean("admin", {
      authScopes: { admin: true, $granted: "me" },
    }),
    canEditClubs: t.boolean({
      resolve: ({ admin, canEditClubs }) => admin || canEditClubs,
      authScopes: { admin: true, $granted: "me" },
    }),
    canEditUsers: t.boolean({
      resolve: ({ admin, canEditUsers }) => admin || canEditUsers,
      authScopes: { admin: true, $granted: "me" },
    }),

    clubs: t.relation("clubs"),
    articles: t.relation("articles"),
    credentials: t.relation("credentials", { authScopes: { $granted: "me" } }),
  }),
});

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
    createdAt: t.expose("createdAt", { type: DateTimeScalar }),
    expiresAt: t.expose("expiresAt", { type: DateTimeScalar, nullable: true }),
    user: t.relation("user", { grantScopes: ["me"] }),
  }),
});

/** List users. */
builder.queryField("me", (t) =>
  t.authField({
    type: UserType,
    authScopes: { loggedIn: true },
    resolve: (_, {}, { user }) => user,
  })
);

/** Logs a user in and returns a session token. */
builder.mutationField("login", (t) =>
  t.prismaField({
    type: CredentialType,
    grantScopes: ["me", "login"],
    args: {
      name: t.arg.string(),
      password: t.arg.string(),
    },
    async resolve(query, _, { name, password }) {
      const credentials = await prisma.credential.findMany({
        where: { type: CredentialPrismaType.Password, user: { name } },
      });

      for (const { value, userId } of credentials) {
        if (await argon2.verify(value, password)) {
          return prisma.credential.create({
            ...query,
            data: { type: CredentialPrismaType.Token, value: nanoid(), userId },
          });
        }
      }

      throw new GraphQLYogaError("Incorrect credentials");
    },
  })
);

/** Registers a new user. */
builder.mutationField("register", (t) =>
  t.prismaField({
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
    resolve: async (query, _, { name, firstname, lastname, password }) =>
      prisma.user.create({
        ...query,
        data: {
          name,
          firstname,
          lastname,
          credentials: {
            create: {
              type: CredentialPrismaType.Password,
              value: await argon2.hash(password, { type: argon2.argon2id }),
            },
          },
        },
      }),
  })
);

/** Deletes a session */
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

/** Gets a user from its id. */
builder.queryField("user", (t) =>
  t.prismaField({
    type: UserType,
    args: { id: t.arg.id() },
    authScopes: { loggedIn: true },
    resolve: async (query, _, { id }) =>
      prisma.user.findUniqueOrThrow({
        ...query,
        where: { id: Number(id) },
      }),
  })
);

/** Searches for user on all text fields. */
builder.queryField("searchUsers", (t) =>
  t.prismaField({
    type: [UserType],
    args: { q: t.arg.string() },
    authScopes: { loggedIn: true },
    async resolve(query, _, { q }) {
      const terms = new Set(String(q).split(" ").filter(Boolean));
      const search = [...terms].join("&");
      return prisma.user.findMany({
        ...query,
        where: {
          firstname: { search },
          lastname: { search },
          name: { search },
          nickname: { search },
        },
      });
    },
  })
);

/** Updates a user. */
builder.mutationField("updateUser", (t) =>
  t.prismaField({
    type: UserType,
    args: {
      id: t.arg.id(),
      nickname: t.arg.string({ validate: { maxLength: 255 } }),
    },
    authScopes: (_, { id }, { user }) =>
      Boolean(user?.canEditUsers || Number(id) === user?.id),
    resolve: (query, _, { id, nickname }) =>
      prisma.user.update({
        ...query,
        where: { id: Number(id) },
        data: { nickname },
      }),
  })
);
