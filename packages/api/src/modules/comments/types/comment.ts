import { builder, prisma, toHtml } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { ReactableInterface } from '#modules/reactions';

export const CommentType = builder.prismaNode('Comment', {
  id: { field: 'id' },
  interfaces: [
    // @ts-expect-error dunno why it complainnns
    ReactableInterface,
  ],
  fields: (t) => ({
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    body: t.exposeString('body'),
    bodyHtml: t.string({
      resolve: async ({ body }) => toHtml(body),
    }),
    document: t.relation('document', { nullable: true }),
    documentId: t.exposeID('documentId', { nullable: true }),
    inReplyTo: t.relation('inReplyTo', { nullable: true }),
    inReplyToId: t.exposeID('inReplyToId', { nullable: true }),
    replies: t.relation('replies'),
    author: t.relation('author', { nullable: true }),
    authorId: t.exposeID('authorId', { nullable: true }),
    reacted: t.boolean({
      args: { emoji: t.arg.string() },
      async resolve({ id }, { emoji }, { user }) {
        if (!user) return false;
        return Boolean(
          await prisma.reaction.findFirst({
            where: {
              commentId: id,
              emoji,
              authorId: user.id,
            },
          }),
        );
      },
    }),
    reactions: t.int({
      args: { emoji: t.arg.string() },
      async resolve({ id }, { emoji }) {
        return prisma.reaction.count({
          where: {
            commentId: id,
            emoji,
          },
        });
      },
    }),
  }),
});
