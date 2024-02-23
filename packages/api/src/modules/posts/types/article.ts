import { builder, htmlToText, prisma, subscriptionName, toHtml } from '#lib';
import { DateTimeScalar, VisibilityEnum } from '#modules/global';

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
