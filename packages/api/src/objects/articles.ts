import { builder } from "../builder.js";
import { DateTimeScalar } from "./scalars.js";

/** Represents an article, published by a member of a club. */
export const ArticleType = builder.prismaObject("Article", {
  fields: (t) => ({
    id: t.exposeID("id"),
    authorId: t.exposeID("authorId", { nullable: true }),
    clubId: t.exposeID("clubId"),
    title: t.exposeString("title"),
    body: t.exposeString("body"),
    published: t.exposeBoolean("published"),
    createdAt: t.expose("createdAt", { type: DateTimeScalar }),
    publishedAt: t.expose("publishedAt", { type: DateTimeScalar }),
    author: t.relation("author", { nullable: true }),
    club: t.relation("club"),
  }),
});
