import { mappedGetAncestors } from 'arborist';
import slug from 'slug';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { DateTimeScalar, FileScalar } from './scalars.js';
import { LinkInput } from './links.js';
import { dichotomid } from 'dichotomid';
import { GraphQLError } from 'graphql';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import imageType, { minimumBytes } from 'image-type';
import { VisibilityEnum } from './events.js';
import { Visibility } from '@prisma/client';
import { scheduleNewArticleNotification } from '../services/notifications.js';

export const ArticleType = builder.prismaNode('Article', {
  id: { field: 'id' },
  fields: (t) => ({
    authorId: t.exposeID('authorId', { nullable: true }),
    groupId: t.exposeID('groupId'),
    eventId: t.exposeID('eventId', { nullable: true }),
    uid: t.exposeString('uid'),
    title: t.exposeString('title'),
    body: t.exposeString('body'),
    bodyHtml: t.string({ resolve: async ({ body }) => toHtml(body) }),
    published: t.exposeBoolean('published'),
    visibility: t.expose('visibility', { type: VisibilityEnum }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    publishedAt: t.expose('publishedAt', { type: DateTimeScalar }),
    pictureFile: t.exposeString('pictureFile'),
    author: t.relation('author', { nullable: true }),
    group: t.relation('group'),
    links: t.relation('links'),
    event: t.relation('event', { nullable: true }),
  }),
});

builder.queryField('article', (t) =>
  t.prismaField({
    type: ArticleType,
    args: {
      groupUid: t.arg.string(),
      uid: t.arg.string(),
    },
    resolve: async (query, _, { uid, groupUid }) =>
      prisma.article.findFirstOrThrow({ ...query, where: { uid, group: { uid: groupUid } } }),
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
          where: { publishedAt: { lte: new Date() }, visibility: Visibility.Public },
          orderBy: { publishedAt: 'desc' },
        });
      }

      // Get the user's groups and their ancestors
      const ancestors = await prisma.group
        // Get all groups in the same family as the user's groups
        .findMany({
          where: { familyId: { in: user.groups.map(({ group }) => group.familyId ?? group.id) } },
          select: { id: true, parentId: true, uid: true },
        })
        // Get all ancestors of the groups
        .then((groups) => mappedGetAncestors(groups, user.groups, { mappedKey: 'groupId' }))
        // Flatten the ancestors into a single array
        .then((groups) => groups.flat());

      return prisma.article.findMany({
        ...query,
        where: {
          publishedAt: {
            lte: new Date(),
          },
          OR: [
            // Show articles from the same school as the user
            {
              visibility: Visibility.Public,
              group: { school: { id: { in: user.major.schools.map(({ id }) => id) } } },
            },
            // Show articles from groups whose user is a member
            {
              visibility: { in: [Visibility.Public, Visibility.Restricted] },
              group: { uid: { in: ancestors.map(({ uid }) => uid) } },
            },
          ],
        },
        orderBy: { publishedAt: 'desc' },
      });
    },
  })
);

builder.mutationField('upsertArticle', (t) =>
  t.prismaField({
    type: ArticleType,
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
      authorId: t.arg.id(),
      groupId: t.arg.id(),
      title: t.arg.string(),
      body: t.arg.string(),
      publishedAt: t.arg({ type: DateTimeScalar }),
      links: t.arg({ type: [LinkInput] }),
      eventId: t.arg.id({ required: false }),
      visibility: t.arg({ type: VisibilityEnum }),
    },
    async authScopes(_, { id, authorId, groupId }, { user }) {
      const creating = !id;
      if (!user) return false;
      if (user.canEditGroups) return true;

      if (creating) {
        if (!groupId) return false;
        return Boolean(
          user.groups.some(
            ({ group: { id }, canEditArticles }) => canEditArticles && groupId === id
          )
        );
      }

      const article = await prisma.article.findUniqueOrThrow({ where: { id } });

      return (
        // Spoofing is disallowed
        ((authorId === user.id &&
          // To set their-self or remove the author, the user must be allowed to write articles
          authorId === article.authorId) ||
          user.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId
          )) &&
        // Who can edit this article?
        // The author
        (user.id === article.authorId ||
          // Other authors of the group
          user.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId
          ))
      );
    },
    async resolve(
      query,
      _,
      { id, eventId, visibility, authorId, groupId, title, body, publishedAt, links }
    ) {
      const old = await prisma.article.findUnique({ where: { id: id ?? '' } });
      const data = {
        author: {
          connect: {
            id: authorId,
          },
        },
        group: {
          connect: {
            id: groupId,
          },
        },
        title,
        body,
        visibility: Visibility[visibility as keyof typeof Visibility],
        publishedAt,
        published: publishedAt <= new Date(),
      };
      const result = await prisma.article.upsert({
        include: {
          ...query.include,
          group: query.include?.group || true,
        },
        where: { id: id ?? '' },
        create: {
          ...data,
          uid: await createUid({ title, groupId }),
          links: { create: links },
          event: eventId ? { connect: { id: eventId } } : undefined,
        },
        update: {
          ...data,
          links: { deleteMany: {}, createMany: { data: links } },
          event: eventId ? { connect: { id: eventId } } : { disconnect: true },
        },
      });
      await scheduleNewArticleNotification({
        ...result,
        // Only post the notification immediately if the article was not already published before.
        // This prevents notifications if the content of the article is changed after its publication; but allows to send notifications immediately if the article was previously set to be published in the future and the author changes their mind and decides to publish it now.
        eager: !old || old.publishedAt > new Date(),
      });
      return result;
    },
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

// builder.queryField('searchArticles', t => t.prismaField({
//   type: [ArticleType],
//   args: {
//     q: t.arg.string(),
//   },
//   async resolve(query, _, { q }) {
//     const terms = new Set(String(q).split(' ').filter(Boolean));
//   }
// }))

export async function createUid({ title, groupId }: { title: string; groupId: string }) {
  const base = slug(title);
  const n = await dichotomid(
    async (n) =>
      !(await prisma.article.findUnique({
        where: { groupId_uid: { groupId, uid: `${base}${n > 1 ? `-${n}` : ''}` } },
      }))
  );
  return `${base}${n > 1 ? `-${n}` : ''}`;
}

builder.mutationField('updateArticlePicture', (t) =>
  t.field({
    type: 'String',
    args: {
      id: t.arg.id(),
      file: t.arg({ type: FileScalar }),
    },
    async authScopes(_, { id }, { user }) {
      const article = await prisma.article.findUniqueOrThrow({
        where: { id },
      });

      return Boolean(
        // Who can edit this article?
        // The author
        user?.id === article.authorId ||
          // Other authors of the group
          user?.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId
          )
      );
    },
    async resolve(_, { id, file }) {
      const type = await file
        .slice(0, minimumBytes)
        .arrayBuffer()
        .then((array) => Buffer.from(array))
        .then(async (buffer) => imageType(buffer));
      if (!type || (type.ext !== 'png' && type.ext !== 'jpg'))
        throw new GraphQLError('File format not supported');

      // Delete the existing picture
      const { pictureFile } = await prisma.article.findUniqueOrThrow({
        where: { id },
        select: { pictureFile: true },
      });

      if (pictureFile) await unlink(new URL(pictureFile, process.env.STORAGE));

      const path = join(`articles`, `${id}.${type.ext}`);
      await mkdir(new URL(dirname(path), process.env.STORAGE), { recursive: true });
      await writeFile(new URL(path, process.env.STORAGE), file.stream());
      await prisma.article.update({ where: { id }, data: { pictureFile: path } });
      return path;
    },
  })
);

builder.mutationField('deleteArticlePicture', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const article = await prisma.article.findUniqueOrThrow({
        where: { id },
      });

      return Boolean(
        // Who can edit this article?
        // The author
        user?.id === article.authorId ||
          // Other authors of the group
          user?.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId
          )
      );
    },
    async resolve(_, { id }) {
      const { pictureFile } = await prisma.article.findUniqueOrThrow({
        where: { id },
        select: { pictureFile: true },
      });

      if (pictureFile) await unlink(new URL(pictureFile, process.env.STORAGE));
      await prisma.article.update({ where: { id }, data: { pictureFile: '' } });
      return true;
    },
  })
);
