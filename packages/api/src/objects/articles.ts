import { builder, prisma, publish, subscriptionName } from '#lib';
import { Visibility, type Article, type Prisma } from '@prisma/client';
import { dichotomid } from 'dichotomid';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import slug from 'slug';
import { updatePicture } from '../pictures.js';
import { fullTextSearch, type SearchResult } from '../search.js';
import { htmlToText, toHtml } from '../services/markdown.js';
import { scheduleNewArticleNotification } from '../services/notifications.js';
import { VisibilityEnum } from './events.js';
import { LinkInput } from './links.js';
import { DateTimeScalar, FileScalar } from './scalars.js';

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
    bodyPreview: t.string({
      async resolve({ body }) {
        const fullText =
          htmlToText(await toHtml(body))
            .split('\n')
            .find((line) => line.trim() !== '') ?? '';
        return fullText.slice(0, 255) + (fullText.length > 255 ? '...' : '');
      },
    }),
    published: t.exposeBoolean('published'),
    visibility: t.expose('visibility', { type: VisibilityEnum }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    notifiedAt: t.expose('notifiedAt', { type: DateTimeScalar, nullable: true }),
    publishedAt: t.expose('publishedAt', { type: DateTimeScalar }),
    pictureFile: t.exposeString('pictureFile'),
    author: t.relation('author', { nullable: true }),
    group: t.relation('group'),
    links: t.relation('links'),
    myReactions: t.field({
      type: 'BooleanMap',
      async resolve({ id }, _, { user }) {
        const reactions = await prisma.reaction.findMany({
          where: { articleId: id },
        });
        const emojis = new Set(reactions.map((r) => r.emoji));
        return Object.fromEntries(
          [...emojis].map((emoji) => [
            emoji,
            user ? reactions.some((r) => r.emoji === emoji && r.authorId === user.id) : false,
          ]),
        );
      },
    }),
    reactionCounts: t.field({
      type: 'Counts',
      async resolve({ id }) {
        const reactions = await prisma.reaction.findMany({
          where: { articleId: id },
          select: { emoji: true },
        });
        // eslint-disable-next-line unicorn/no-array-reduce
        return reactions.reduce<Record<string, number>>(
          (counts, { emoji }) => ({ ...counts, [emoji]: (counts[emoji] ?? 0) + 1 }),
          {},
        );
      },
    }),
    comments: t.relatedConnection('comments', {
      cursor: 'id',
      query: {
        orderBy: { createdAt: 'asc' },
      },
      subscribe(subscriptions, { id }) {
        subscriptions.register(subscriptionName('Comment', 'created', id));
        subscriptions.register(subscriptionName('Comment', 'updated', id));
        subscriptions.register(subscriptionName('Comment', 'deleted', id));
      },
    }),
    event: t.relation('event', { nullable: true }),
  }),
});

/**
 * Articles that the given user can see
 * @param user the user
 * @param level if 'wants', only return articles that the user _wants_ to see, if 'can', shows all the articles they have access to
 * @returns a Prisma.ArticleWhereInput, an object to pass inside of a `where` field in a prisma query
 */
export function visibleArticlesPrismaQuery(
  user: { uid: string; canEditGroups: boolean } | undefined,
  level: 'can' | 'wants',
): Prisma.ArticleWhereInput {
  // Get the user's groups and their ancestors
  if (user?.canEditGroups && level === 'can') return {};
  return {
    OR: [
      {
        publishedAt: { lte: new Date() },
        // Published articles that are
        OR: [
          // Public
          { visibility: Visibility.Public },
          // SchoolRestricted and the user is a student of this school
          {
            visibility: Visibility.SchoolRestricted,
            group: {
              studentAssociation: {
                school: {
                  majors: {
                    some: {
                      students: {
                        some: {
                          uid: user?.uid ?? '',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          // GroupRestricted to the group and the user is a member of the group
          // or a member of a children group
          // TODO handle children of children
          {
            visibility: Visibility.GroupRestricted,
            group: {
              OR: [
                {
                  members: {
                    some: {
                      member: { uid: user?.uid ?? '' },
                    },
                  },
                },
                {
                  children: {
                    some: {
                      members: {
                        some: {
                          member: { uid: user?.uid ?? '' },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },

      // Or the user has permission to create articles
      {
        group: {
          members: {
            some: {
              member: { uid: user?.uid ?? '' },
              canEditArticles: true,
            },
          },
        },
      },

      // Or the user is the author
      {
        author: {
          uid: user?.uid ?? '',
        },
      },
    ],
  };
}

builder.queryField('article', (t) =>
  t.prismaField({
    type: ArticleType,
    smartSubscription: true,
    args: {
      groupUid: t.arg.string(),
      uid: t.arg.string(),
    },
    resolve: async (query, _, { uid, groupUid }, { user }) =>
      prisma.article.findFirstOrThrow({
        ...query,
        where: {
          ...visibleArticlesPrismaQuery(user, 'can'),
          uid,
          group: { uid: groupUid },
        },
      }),
  }),
);

builder.queryField('homepage', (t) =>
  t.prismaConnection({
    description: 'Gets the homepage articles, customized if the user is logged in.',
    type: ArticleType,
    cursor: 'id',
    smartSubscription: true,
    subscribe(subs) {
      subs.register(subscriptionName('Article', 'created'));
    },
    async resolve(query, _, {}, { user }) {
      if (!user) {
        return prisma.article.findMany({
          ...query,
          where: { publishedAt: { lte: new Date() }, visibility: Visibility.Public },
          orderBy: { publishedAt: 'desc' },
        });
      }

      return prisma.article.findMany({
        ...query,
        where: visibleArticlesPrismaQuery(user, 'wants'),
        orderBy: { publishedAt: 'desc' },
      });
    },
  }),
);

builder.mutationField('upsertArticle', (t) =>
  t.prismaField({
    type: ArticleType,
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
      authorId: t.arg.id(),
      groupId: t.arg.id(),
      title: t.arg.string({ validate: { minLength: 1 } }),
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
            ({ group: { id }, canEditArticles }) => canEditArticles && groupId === id,
          ),
        );
      }

      const article = await prisma.article.findUniqueOrThrow({ where: { id } });

      return (
        // Spoofing is disallowed
        ((authorId === user.id &&
          // To set their-self or remove the author, the user must be allowed to write articles
          authorId === article.authorId) ||
          user.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId,
          )) &&
        // Who can edit this article?
        // The author
        (user.id === article.authorId ||
          // Other authors of the group
          user.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId,
          ))
      );
    },
    async resolve(
      query,
      _,
      { id, eventId, visibility, authorId, groupId, title, body, publishedAt, links },
      { user },
    ) {
      const old = await prisma.article.findUnique({ where: { id: id ?? '' } });
      const data = {
        // eslint-disable-next-line unicorn/no-null
        notifiedAt: null,
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
        visibility: Visibility[visibility],
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
      publish(result.id, id ? 'updated' : 'created', result);
      await prisma.logEntry.create({
        data: {
          area: 'article',
          action: id ? 'update' : 'create',
          target: result.id,
          message: `Article ${id ? 'updated' : 'created'}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      const visibilitiesByVerbosity = [
        Visibility.Private,
        Visibility.Unlisted,
        Visibility.GroupRestricted,
        Visibility.SchoolRestricted,
        Visibility.Public,
      ];
      void scheduleNewArticleNotification(result, {
        // Only post the notification immediately if the article was not already published before.
        // This prevents notifications if the content of the article is changed after its publication; but allows to send notifications immediately if the article was previously set to be published in the future and the author changes their mind and decides to publish it now.
        eager:
          !old ||
          old.publishedAt > new Date() ||
          // send new notifications when changing visibility of article to a more public one (e.g. from private to school-restricted)
          visibilitiesByVerbosity.indexOf(result.visibility) >
            visibilitiesByVerbosity.indexOf(old.visibility),
      });
      return result;
    },
  }),
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
        // Admins
        user.admin ||
        // The author
        user.id === article.authorId ||
        // Other authors of the group
        user.groups.some(
          ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId,
        )
      );
    },
    async resolve(_, { id }, { user }) {
      await prisma.article.delete({ where: { id } });

      await prisma.logEntry.create({
        data: {
          area: 'article',
          action: 'delete',
          target: id,
          message: `Article ${id} deleted`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      publish(id, 'deleted', id);
      return true;
    },
  }),
);

export const ArticleSearchResultType = builder
  .objectRef<SearchResult<{ article: Article }, ['body', 'title']>>('UserSearchResult')
  .implement({
    fields: (t) => ({
      article: t.prismaField({
        type: 'Article',
        resolve: (_, { article }) => article,
      }),
      id: t.exposeID('id'),
      similarity: t.exposeFloat('similarity'),
      rank: t.exposeFloat('rank', { nullable: true }),
      highlightedTitle: t.string({
        resolve: ({ highlights }) => highlights.title,
      }),
    }),
  });

builder.queryField('searchArticles', (t) =>
  t.field({
    type: [ArticleSearchResultType],
    args: {
      q: t.arg.string(),
      groupUid: t.arg.string({ required: false }),
    },
    async resolve(_, { q, groupUid }, { user }) {
      const group = groupUid
        ? await prisma.group.findUniqueOrThrow({ where: { uid: groupUid } })
        : undefined;
      return fullTextSearch('Article', q, {
        property: 'article',
        resolveObjects: (ids) =>
          prisma.article.findMany({
            where: { AND: [{ id: { in: ids } }, visibleArticlesPrismaQuery(user, 'can')] },
          }),
        fuzzy: ['title', 'body'],
        highlight: ['title', 'body'],
        htmlHighlights: ['title', 'body'],
        additionalClauses: group ? { groupId: group.id } : {},
      });
    },
  }),
);

export async function createUid({ title, groupId }: { title: string; groupId: string }) {
  const base = slug(title);
  const n = await dichotomid(
    async (n) =>
      !(await prisma.article.findUnique({
        where: { groupId_uid: { groupId, uid: `${base}${n > 1 ? `-${n}` : ''}` } },
      })),
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
      if (user?.canEditGroups) return true;

      return Boolean(
        // Who can edit this article?
        // Admins
        user?.admin ||
          // The author
          user?.id === article.authorId ||
          // Other authors of the group
          user?.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId,
          ),
      );
    },
    async resolve(_, { id, file }, { user }) {
      await prisma.logEntry.create({
        data: {
          area: 'article',
          action: 'update',
          target: id,
          message: `Article ${id} picture updated`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return updatePicture({
        resource: 'article',
        folder: 'articles',
        extension: 'jpg',
        file,
        identifier: id,
      });
    },
  }),
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
      if (user?.canEditGroups) return true;

      return Boolean(
        // Who can edit this article?
        // Admins
        user?.admin ||
          // The author
          user?.id === article.authorId ||
          // Other authors of the group
          user?.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId,
          ),
      );
    },
    async resolve(_, { id }, { user }) {
      const { pictureFile } = await prisma.article.findUniqueOrThrow({
        where: { id },
        select: { pictureFile: true },
      });

      const root = new URL(process.env.STORAGE).pathname;

      if (pictureFile) await unlink(join(root, pictureFile));
      await prisma.article.update({ where: { id }, data: { pictureFile: '' } });
      await prisma.logEntry.create({
        data: {
          area: 'article',
          action: 'delete',
          target: id,
          message: `Article ${id} picture deleted`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return true;
    },
  }),
);
