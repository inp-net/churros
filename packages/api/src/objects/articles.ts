import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar } from './scalars.js';

/** Represents an article, published by a member of a group. */
export const ArticleType = builder.prismaObject('Article', {
  fields: (t) => ({
    id: t.exposeID('id'),
    authorId: t.exposeID('authorId', { nullable: true }),
    groupId: t.exposeID('groupId'),
    title: t.exposeString('title'),
    body: t.exposeString('body'),
    bodyHtml: t.string({
      resolve: async ({ body }) =>
        unified()
          .use(remarkParse)
          // Downlevel titles (h1 -> h3)
          .use(() => ({ children }) => {
            for (const child of children) {
              if (child.type === 'heading')
                child.depth = Math.min(child.depth + 2, 6) as 3 | 4 | 5 | 6;
            }
          })
          .use(remarkRehype)
          .use(rehypeSanitize)
          .use(rehypeStringify)
          .process(body)
          .then(String),
    }),
    published: t.exposeBoolean('published'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    publishedAt: t.expose('publishedAt', { type: DateTimeScalar }),
    author: t.relation('author', { nullable: true }),
    group: t.relation('group'),
  }),
});

/** Returns a specific article. */
builder.queryField('article', (t) =>
  t.prismaField({
    type: ArticleType,
    args: { id: t.arg.id() },
    resolve: async (query, _, { id }) =>
      prisma.article.findUniqueOrThrow({ ...query, where: { id } }),
  })
);

/** Returns a list of articles from the groups the user is in. */
builder.queryField('homepage', (t) =>
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
          cursor: after ? { id: after } : undefined,
          skip: after ? 1 : 0,
          take: first,
          // Only public articles
          where: { published: true, homepage: true },
          orderBy: { publishedAt: 'desc' },
        });
      }

      return prisma.article.findMany({
        ...query,
        // Pagination
        cursor: after ? { id: after } : undefined,
        skip: after ? 1 : 0,
        take: first,
        where: {
          published: true,
          OR: [
            // Show articles from the same school as the user
            {
              homepage: true,
              group: { school: { id: { in: user.major.schools.map(({ id }) => id) } } },
            },
            // Show articles from groups whose user is a member
            { group: { members: { some: { memberId: user.id } } } },
          ],
        },
        orderBy: { publishedAt: 'desc' },
      });
    },
  })
);

/** Inserts a new article. */
builder.mutationField('createArticle', (t) =>
  t.prismaField({
    type: ArticleType,
    args: {
      groupId: t.arg.id(),
      title: t.arg.string(),
      body: t.arg.string(),
    },
    authScopes: (_, { groupId }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ groupId: id, canEditArticles }) => canEditArticles && groupId === id)
      ),
    resolve: (query, _, { groupId, body, title }, { user }) =>
      prisma.article.create({
        ...query,
        data: {
          groupId,
          authorId: user!.id,
          title,
          body,
        },
      }),
  })
);

/** Updates an article. */
builder.mutationField('updateArticle', (t) =>
  t.prismaField({
    type: ArticleType,
    args: {
      id: t.arg.id(),
      authorId: t.arg.id({ required: false }),
      title: t.arg.string(),
      body: t.arg.string(),
      published: t.arg.boolean(),
    },
    async authScopes(_, { id, authorId }, { user }) {
      if (!user) return false;
      if (user.canEditGroups) return true;

      const article = await prisma.article.findUniqueOrThrow({ where: { id } });

      // Who can change the author?
      if (authorId !== undefined) {
        // To set their-self or remove the author, the user must be allowed to write articles
        if (authorId === user.id || authorId === null) {
          return (
            authorId === article.authorId ||
            user.groups.some(
              ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId
            )
          );
        }

        // Spoofing is forbidden
        return false;
      }

      // Who can edit this article?
      return (
        // The author
        user.id === article.authorId ||
        // Other authors of the group
        user.groups.some(
          ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId
        )
      );
    },
    resolve: async (query, _, { id, authorId, title, body, published }) =>
      prisma.article.update({
        ...query,
        where: { id },
        data: { authorId, title, body, published, publishedAt: published ? new Date() : undefined },
      }),
  })
);

/** Deletes an article. */
builder.mutationField('deleteArticle', (t) =>
  t.field({
    type: 'Boolean',
    args: { id: t.arg.id() },
    async authScopes(_, { id }, { user }) {
      if (!user) return false;
      if (user.canEditGroups) return true;

      const article = await prisma.article.findUniqueOrThrow({ where: { id } });

      // Who can delete this article?
      return (
        // The author
        user.id === article.authorId ||
        // Other authors of the group
        user.groups.some(
          ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId
        )
      );
    },
    async resolve(_, { id }) {
      await prisma.article.delete({ where: { id } });
      return true;
    },
  })
);
