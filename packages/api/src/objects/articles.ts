import { builder } from "../builder.js";
import { prisma } from "../prisma.js";
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

/** Inserts a new article. */
builder.mutationField("createArticle", (t) =>
  t.prismaField({
    type: ArticleType,
    args: {
      clubId: t.arg.id(),
      title: t.arg.string(),
      body: t.arg.string(),
    },
    async authScopes(_, { clubId }, { user }) {
      if (!user) return false;
      const member = await prisma.clubMember.findUnique({
        where: {
          memberId_clubId: { clubId: Number(clubId), memberId: user.id },
        },
      });
      return member.canPostArticles;
    },
    resolve(query, _, { clubId, body, title }, { user }) {
      return prisma.article.create({
        ...query,
        data: {
          clubId: Number(clubId),
          authorId: user!.id,
          title,
          body,
        },
      });
    },
  })
);
