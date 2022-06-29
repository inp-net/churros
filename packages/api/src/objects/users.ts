import { GraphQLYogaError } from "@graphql-yoga/node";
import { CredentialType } from "@prisma/client";
import argon2 from "argon2";
import { nanoid } from "nanoid";
import { builder } from "../builder.js";
import { prisma } from "../prisma.js";
import { DateTimeScalar } from "./scalars.js";

/** Represents a user, mapped on the underlying database object. */
export const UserType = builder.prismaObject("User", {
  grantScopes({ id }, { user }) {
    if (user?.id === id) return ["me"];
    return [];
  },
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
    canEditClubs: t.exposeBoolean("canEditClubs", {
      authScopes: { admin: true, $granted: "me" },
    }),
    canEditUsers: t.exposeBoolean("canEditUsers", {
      authScopes: { admin: true, $granted: "me" },
    }),

    clubs: t.relation("clubs"),
    articles: t.relation("articles"),
  }),
});

/** Represents a Session, owned by a user. */
export const SessionType = builder.objectType(
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
  t.field({
    type: SessionType,
    args: {
      name: t.arg.string(),
      password: t.arg.string(),
    },
    async resolve(_, { name, password }) {
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
  })
);
