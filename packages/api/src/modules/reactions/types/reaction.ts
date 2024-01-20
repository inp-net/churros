import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const ReactionType = builder.prismaNode('Reaction', {
  id: { field: 'id' },
  fields: (t) => ({
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    emoji: t.exposeString('emoji'),
    document: t.relation('document', { nullable: true }),
    documentId: t.exposeID('documentId', { nullable: true }),
    comment: t.relation('comment', { nullable: true }),
    commentId: t.exposeID('commentId', { nullable: true }),
    author: t.relation('author', { nullable: true }),
    authorId: t.exposeID('authorId', { nullable: true }),
  }),
});
