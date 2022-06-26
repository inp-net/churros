import { builder } from "../builder.js";
import { prisma } from "../prisma.js";
import { ArticleType } from "./articles.js";

/** Returns a list of articles from the clubs the user is in. */
builder.queryField("homepage", (t) =>
  t.prismaField({
    type: [ArticleType],
    authScopes: { loggedIn: true },
    args: {
      first: t.arg.int({ defaultValue: 20 }),
      after: t.arg.id({ required: false }),
    },
    async resolve(query, _, { first, after }, { user }) {
      return prisma.article.findMany({
        ...query,
        // Pagination
        cursor: after ? { id: Number(after) } : undefined,
        skip: after ? 1 : 0,
        take: first,
        where: {
          published: true,
          club: { members: { some: { memberId: user!.id } } },
        },
        orderBy: { publishedAt: "desc" },
      });
    },
  })
);
