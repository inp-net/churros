import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
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
    bodyHtml: t.string({
      resolve({ body }) {
        return unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeSanitize)
          .use(rehypeStringify)
          .process(body)
          .then((file) => String(file));
      },
    }),
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
      return Boolean(
        user?.clubs.some(
          ({ clubId: id, canPostArticles }) =>
            canPostArticles && Number(clubId) === id
        )
      );
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
