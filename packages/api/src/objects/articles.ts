import { mappedGetAncestors } from 'arborist';
import slug from 'slug';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { DateTimeScalar } from './scalars.js';
import { LinkInput } from './links.js';

export const ArticleType = builder.prismaNode('Article', {
  id: { field: 'id' },
  fields: (t) => ({
    // authorId: t.exposeID('authorId', { nullable: true }),
    // groupId: t.exposeID('groupId'),
    uid: t.exposeString('uid'),
    title: t.exposeString('title'),
    body: t.exposeString('body'),
    bodyHtml: t.string({ resolve: async ({ body }) => toHtml(body) }),
    published: t.exposeBoolean('published'),
    homepage: t.exposeBoolean('homepage'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    publishedAt: t.expose('publishedAt', { type: DateTimeScalar }),
    author: t.relation('author', { nullable: true }),
    group: t.relation('group'),
    links: t.relation('links'),
  }),
});

builder.queryField('article', (t) =>
  t.prismaField({
    type: ArticleType,
    args: {
      uid: t.arg.string(),
      slug: t.arg.string(),
    },
    resolve: async (query, _, { uid, slug }) =>
      prisma.article.findFirstOrThrow({ ...query, where: { slug, group: { uid } } }),
  })
);

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

      // Get the user's groups and their ancestors
      const ancestors = await prisma.group
        // Get all groups in the same family as the user's groups
        .findMany({
          where: { familyId: { in: user.groups.map(({ group }) => group.familyId) } },
          select: { id: true, parentId: true, uid: true },
        })
        // Get all ancestors of the groups
        .then((groups) => mappedGetAncestors(groups, user.groups, { mappedKey: 'groupId' }))
        // Flatten the ancestors into a single array
        .then((groups) => groups.flat());

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
            { group: { uid: { in: ancestors.map(({ uid }) => uid) } } },
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
          slug: slug(title),
          title,
          body,
          links: { create: [] },
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
      groupId: t.arg.id({ required: false }),
      title: t.arg.string(),
      body: t.arg.string(),
      published: t.arg.boolean(),
      links: t.arg({ type: [LinkInput] }),
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
    resolve: async (query, _, { id, authorId, groupId, title, body, published, links }) =>
      prisma.article.update({
        ...query,
        where: { id },
        data: {
          author: { connect: authorId === null ? undefined : { id: authorId } },
          group: { connect: groupId === null ? undefined : { id: groupId } },
          title,
          body,
          published,
          publishedAt: published ? new Date() : undefined,
          links: {
            update: {
              links: { deleteMany: {}, createMany: { data: links } },
            },
          },
        },
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
