import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { DateTimeScalar } from './scalars.js';

export const ArticleType = builder.prismaNode('Article', {
  id: { field: 'id' },
  fields: (t) => ({
    authorId: t.exposeID('authorId', { nullable: true }),
    groupId: t.exposeID('groupId'),
    title: t.exposeString('title'),
    body: t.exposeString('body'),
    bodyHtml: t.string({ resolve: async ({ body }) => toHtml(body) }),
    published: t.exposeBoolean('published'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    publishedAt: t.expose('publishedAt', { type: DateTimeScalar }),
    author: t.relation('author', { nullable: true }),
    group: t.relation('group'),
  }),
});

builder.queryField('homepage', (t) =>
  t.prismaConnection({
    description: 'Gets the homepage articles, customized if the user is logged in.',
    type: ArticleType,
    cursor: 'id',
    async resolve(query, _, {}, { user }) {
      if (!user) {
        return prisma.article.findMany({
          ...query,
          where: { published: true, homepage: true },
          orderBy: { publishedAt: 'desc' },
        });
      }

      return prisma.article.findMany({
        ...query,
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

builder.mutationField('createArticle', (t) =>
  t.prismaField({
    type: ArticleType,
    args: {
      groupUid: t.arg.string(),
      title: t.arg.string(),
      body: t.arg.string(),
    },
    authScopes: (_, { groupUid }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(
            ({ group: { uid }, canEditArticles }) => canEditArticles && groupUid === uid
          )
      ),
    resolve: (query, _, { groupUid, body, title }, { user }) =>
      prisma.article.create({
        ...query,
        data: {
          group: { connect: { uid: groupUid } },
          author: { connect: { id: user!.id } },
          title,
          body,
        },
      }),
  })
);

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
