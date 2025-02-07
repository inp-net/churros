import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const ReactionType = builder.prismaNode('Reaction', {
  id: { field: 'id' },
  fields: (t) => ({
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    emoji: t.exposeString('emoji'),
    document: t.relation('document', { nullable: true }),
    documentId: t.exposeID('documentId', { nullable: true }),
    author: t.relation('author', { nullable: true }),
    authorId: t.exposeID('authorId', { nullable: true }),
    subject: t.field({
      type: builder.nodeInterfaceRef(),
      nullable: true,
      resolve({ documentId, articleId, eventId }) {
        return documentId
          ? prisma.document.findUnique({ where: { id: documentId } })
          : articleId
            ? prisma.article.findUnique({ where: { id: articleId } })
            : eventId
              ? prisma.event.findUnique({ where: { id: eventId } })
              : null;
      },
    }),
  }),
});
