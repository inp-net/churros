import { builder, htmlToText, prisma, toHtml } from '#lib';
import { CommentableInterface } from '#modules/comments';
import {
  DateTimeScalar,
  PicturedInterface,
  ShareableInterface,
  VisibilityEnum,
} from '#modules/global';
import { ReactableInterface } from '#modules/reactions';
import { canEditArticle } from '../utils/permissions.js';

// TODO rename to Post
export const ArticleType = builder.prismaNode('Article', {
  id: { field: 'id' },
  include: { reactions: true },
  interfaces: [
    // @ts-expect-error dunno why it complainnns
    CommentableInterface,
    PicturedInterface,
    ReactableInterface,
    // FIXME: Gives a "not implemented" error
    // so HasLinks is an enum for now
    // builder.interfaceRef('HasLinks'),
    // @ts-expect-error dunno why it complainnns
    ShareableInterface,
  ],
  fields: (t) => ({
    authorId: t.exposeID('authorId', { nullable: true }),
    groupId: t.exposeID('groupId'),
    eventId: t.exposeID('eventId', { nullable: true }),
    uid: t.exposeString('slug', {
      deprecationReason: 'Use `slug` instead. This field was never universally unique.',
    }),
    slug: t.exposeString('slug', {
      description: 'Un nom lisible sans espaces, adaptés pour des URLs.',
    }),
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
    canBeEdited: t.boolean({
      description:
        "Vrai si l'utilisateur·ice connecté·e peut éditer le post (en considérant qu'iel ne va pas changer l'auteur·ice ou le groupe du post)",
      async resolve({ id }, _, { user }) {
        const article = await prisma.article.findUniqueOrThrow({
          where: { id },
          include: canEditArticle.prismaIncludes,
        });
        return canEditArticle(article, article, user);
      },
    }),
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
    shares: t.int({
      async resolve({ id }) {
        const {
          _count: { sharedBy },
        } = await prisma.article.findUniqueOrThrow({
          where: { id },
          select: {
            _count: { select: { sharedBy: true } },
          },
        });
        return sharedBy;
      },
    }),
    event: t.relation('event', { nullable: true }),
  }),
});
