import { setTimeout } from "timers/promises";
import { builder } from "../builder.js";
import { prisma } from "../prisma.js";
import { DateTimeScalar } from "./scalars.js";

/** Represents a club, mapped on the underlying database object. */
export const ClubType = builder.prismaObject("Club", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    members: t.relation("members", {
      // Seeing group members requires being logged in
      authScopes: { loggedIn: true },
    }),
    articles: t.relation("articles"),
  }),
});

/**
 * Represents a club member, mapped on the underlying database object.
 *
 * This is the intermediate object in the many to many relationship.
 */
export const ClubMemberType = builder.prismaObject("ClubMember", {
  fields: (t) => ({
    memberId: t.exposeID("memberId"),
    clubId: t.exposeID("clubId"),
    title: t.string({ resolve: ({ title }) => title || "Membre" }),
    president: t.exposeBoolean("president"),
    treasurer: t.exposeBoolean("treasurer"),
    canEditMembers: t.exposeBoolean("canEditMembers"),
    canEditArticles: t.exposeBoolean("canEditArticles"),
    createdAt: t.expose("createdAt", { type: DateTimeScalar }),
    member: t.relation("member"),
    club: t.relation("club"),
  }),
});

/** List clubs. */
builder.queryField("clubs", (t) =>
  t.prismaField({
    type: [ClubType],
    resolve: (query) => prisma.club.findMany(query),
  })
);

/** Get a specific club. */
builder.queryField("club", (t) =>
  t.prismaField({
    type: ClubType,
    args: { id: t.arg.id() },
    resolve: (query, _, { id }) =>
      prisma.club.findUniqueOrThrow({ ...query, where: { id: Number(id) } }),
  })
);

/** Adds a member to a club. The member is found by their name. */
builder.mutationField("addClubMember", (t) =>
  t.prismaField({
    type: ClubMemberType,
    args: {
      clubId: t.arg.id(),
      name: t.arg.string(),
      title: t.arg.string(),
    },
    authScopes: (_, { clubId }, { user }) =>
      Boolean(
        user?.canEditClubs ||
          user?.clubs.some(
            ({ clubId: id, canEditMembers }) =>
              canEditMembers && Number(clubId) === id
          )
      ),
    resolve: (query, _, { clubId, name, title }) =>
      prisma.clubMember.create({
        ...query,
        data: {
          member: { connect: { name } },
          club: { connect: { id: Number(clubId) } },
          title,
        },
      }),
  })
);

/** Removes a member from a club. */
builder.mutationField("deleteClubMember", (t) =>
  t.field({
    type: "Boolean",
    args: {
      memberId: t.arg.id(),
      clubId: t.arg.id(),
    },
    authScopes: (_, { clubId }, { user }) =>
      Boolean(
        user?.canEditClubs ||
          user?.clubs.some(
            ({ clubId: id, canEditMembers }) =>
              canEditMembers && Number(clubId) === id
          )
      ),
    async resolve(_, { memberId, clubId }) {
      await prisma.clubMember.delete({
        where: {
          memberId_clubId: {
            memberId: Number(memberId),
            clubId: Number(clubId),
          },
        },
      });
      return true;
    },
  })
);

/** Updates a club member. */
builder.mutationField("updateClubMember", (t) =>
  t.prismaField({
    type: ClubMemberType,
    args: {
      memberId: t.arg.id(),
      clubId: t.arg.id(),
      title: t.arg.string(),
    },
    authScopes: (_, { clubId }, { user }) =>
      Boolean(
        user?.canEditClubs ||
          user?.clubs.some(
            ({ clubId: id, canEditMembers }) =>
              canEditMembers && Number(clubId) === id
          )
      ),
    resolve: (query, _, { memberId, clubId, title }) =>
      prisma.clubMember.update({
        ...query,
        where: {
          memberId_clubId: {
            memberId: Number(memberId),
            clubId: Number(clubId),
          },
        },
        data: { title },
      }),
  })
);
