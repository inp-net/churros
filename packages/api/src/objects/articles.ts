import { builder } from "../builder.js";

/** Represents an article, published by a member of a club. */
export const ArticleType = builder.prismaObject("Article", {
  fields: (t) => ({
    id: t.exposeID("id"),
    authorId: t.exposeID("authorId", { nullable: true }),
    clubId: t.exposeID("clubId"),
    title: t.exposeString("title"),
    body: t.exposeString("body"),
    published: t.exposeBoolean("published"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    publishedAt: t.expose("publishedAt", { type: "DateTime" }),
    author: t.relation("author"),
    club: t.relation("club"),
  }),
});
