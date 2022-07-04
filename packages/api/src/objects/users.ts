import { CredentialType as CredentialPrismaType } from "@prisma/client";
import { hash } from "argon2";
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

/** List users. */
builder.queryField("me", (t) =>
  t.authField({
    type: UserType,
    authScopes: { loggedIn: true },
    resolve: (_, {}, { user }) => user,
  })
);

/** Registers a new user. */
builder.mutationField("register", (t) =>
  t.prismaField({
    type: UserType,
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
              value: await hash(password),
            },
          },
        },
      }),
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
