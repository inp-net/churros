import { builder } from '../builder';
import { prisma } from '../prisma';
import { toHtml } from '../services/markdown';
import { DateTimeScalar } from './scalars';

export const CommentType = builder.prismaNode('Comment', {
    id: { field: 'id' },
    fields: (t) => ({
        createdAt: t.expose('createdAt', { type: DateTimeScalar }),
        updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
        body: t.exposeString('body'),
        bodyHtml: t.string({
            resolve: async ({ body }) => toHtml(body),
        }),
        document: t.relation('document'),
        documentId: t.exposeID('documentId'),
        inReplyTo: t.relation('inReplyTo', { nullable: true }),
        inReplyToId: t.exposeID('inReplyToId', { nullable: true }),
        replies: t.relation('replies'),
    }),
});

builder.queryField('comments', (t) =>
    t.prismaConnection({
        type: CommentType,
        cursor: 'id',
        async authScopes(_, { }, { user }) {
            // todo
        },
        async resolve(query, _, { }, { user }) {
            return prisma.comment.findMany({
                ...query,
                orderBy: { updatedAt: 'desc' },
            });
        },
    })
);

builder.queryField('comment', (t) =>
    t.prismaField({
        type: CommentType,
        args: {
            id: t.arg.id(),
        },
        async authScopes(_, { id }, { user }) {
            // todo
        },
        async resolve(query, _, { id }, { user }) {
            return prisma.comment.findUnique({
                ...query,
                where: { id },
            });
        },
    })
);

builder.mutationField('upsertComment', (t) =>
    t.prismaField({
        type: CommentType,
        args: {
            id: t.arg.id({ required: false }),
            // todo
        },
        async authScopes(_, { id }, { user }) {
            // todo
        },
        async resolve(query, _, { id }, { user }) {
            const upsertData = {
                // todo
            };
            return prisma.comment.upsert({
                ...query,
                where: { id: id ?? '' },
                create: upsertData,
                update: upsertData,
            });
        },
    })
);

builder.mutationField('deleteComment', (t) =>
    t.prismaField({
        type: 'Boolean',
        args: {
            id: t.arg.id(),
        },
        async authScopes(_, { id }, { user }) {
            // todo
        },
        async resolve(_query, _, { id }, { user }) {
            await prisma.comment.delete({
                where: { id },
            });
            return true;
        },
    })
);
