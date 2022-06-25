import { builder } from "../builder.js";
import { DateTimeScalar } from "./scalars.js";

/** Represents a club, mapped on the underlying database object. */
export const ClubType = builder.prismaObject("Club", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    members: t.relation("members"),
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
  }),
});
