import { builder } from '../builder';
import { prisma } from '../prisma';
import { DateTimeScalar } from './scalars';

export const SubjectType = builder.prismaNode('Subject', {
    id: { field: 'id' },
    fields: (t) => ({
        name: t.exposeString('name'),
        uid: t.exposeString('uid'),
        nextExamAt: t.expose('nextExamAt', { type: DateTimeScalar, nullable: true }),
        majors: t.relation('majors'),
        minors: t.relation('minors'),
        documents: t.relatedConnection('documents', {
            type: DocumentType,
            cursor: 'id',
        })
    }),
});

builder.queryField('subjects', (t) =>
    t.prismaConnection({
        type: SubjectType,
        cursor: 'id',
        async authScopes(_, { }, { user }) {
            // todo
        },
        async resolve(query, _, { }, { user }) {
            return prisma.subject.findMany({
                ...query,
                orderBy: { updatedAt: 'desc' },
            });
        },
    })
);

builder.queryField('subject', (t) =>
    t.prismaField({
        type: SubjectType,
        args: {
            id: t.arg.id(),
        },
        async authScopes(_, { id }, { user }) {
            // todo
        },
        async resolve(query, _, { id }, { user }) {
            return prisma.subject.findUnique({
                ...query,
                where: { id },
            });
        },
    })
);

builder.mutationField('upsertSubject', (t) =>
    t.prismaField({
        type: SubjectType,
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
            return prisma.subject.upsert({
                ...query,
                where: { id: id ?? '' },
                create: upsertData,
                update: upsertData,
            });
        },
    })
);

builder.mutationField('deleteSubject', (t) =>
    t.prismaField({
        type: 'Boolean',
        args: {
            id: t.arg.id(),
        },
        async authScopes(_, { id }, { user }) {
            // todo
        },
        async resolve(_query, _, { id }, { user }) {
            await prisma.subject.delete({
                where: { id },
            });
            return true;
        },
    })
);
