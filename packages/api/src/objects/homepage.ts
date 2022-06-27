import { builder } from "../builder.js";
import { prisma } from "../prisma.js";
import { ArticleType } from "./articles.js";

/** Returns a list of articles from the clubs the user is in. */
builder.queryField("homepage", (t) =>
  t.prismaField({
    type: [ArticleType],
    args: {
      first: t.arg.int({ required: false }),
      after: t.arg.id({ required: false }),
    },
    async resolve(query, _, { first, after }, { user }) {
      first ??= 20;
      if (!user) {
        return prisma.article.findMany({
          ...query,
          // Pagination
          cursor: after ? { id: Number(after) } : undefined,
          skip: after ? 1 : 0,
          take: first,
          // Only public articles
          where: { published: true, homepage: true },
          orderBy: { publishedAt: "desc" },
        });
      }

      return prisma.article.findMany({
        ...query,
        // Pagination
        cursor: after ? { id: Number(after) } : undefined,
        skip: after ? 1 : 0,
        take: first,
        where: {
          published: true,
          OR: [
            { homepage: true },
            // Show articles from clubs whose user is a member
            { club: { members: { some: { memberId: user.id } } } },
          ],
        },
        orderBy: { publishedAt: "desc" },
      });
    },
  })
);
