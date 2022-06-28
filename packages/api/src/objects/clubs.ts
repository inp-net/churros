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
    title: t.exposeString("title", { nullable: true }),
    president: t.exposeBoolean("president"),
    treasurer: t.exposeBoolean("treasurer"),
    canAddMembers: t.exposeBoolean("canAddMembers"),
    canPostArticles: t.exposeBoolean("canPostArticles"),
    createdAt: t.expose("createdAt", { type: DateTimeScalar }),
    member: t.relation("member"),
    club: t.relation("club"),
  }),
});

/** List clubs. */
builder.queryField("clubs", (t) =>
  t.prismaField({
    type: [ClubType],
    resolve(query) {
      return prisma.club.findMany(query);
    },
  })
);

/** Get a specific club. */
builder.queryField("club", (t) =>
  t.prismaField({
    type: ClubType,
    args: { id: t.arg.id() },
    resolve(query, _, { id }) {
      return prisma.club.findUnique({ ...query, where: { id: Number(id) } });
    },
  })
);
