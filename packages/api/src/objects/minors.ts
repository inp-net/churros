import { builder } from '../builder';
import { prisma } from '../prisma';

export const MinorType = builder.prismaNode('Minor', {
    id: { field: 'id' },
    fields: (t) => ({
        name: t.exposeString('name'),
        uid: t.exposeString('uid'),
        yearTier: t.exposeInt('yearTier'),
        subjects: t.relation('subjects'),
        majors: t.relation('majors'),
        users: t.relation('users'),
    }),
});

builder.queryField('minors', (t) =>
    t.prismaConnection({
        type: MinorType,
        cursor: 'id',
        authScopes() {
            return true
        },
        async resolve(query) {
            return prisma.minor.findMany({
                ...query,
            });
        },
    })
);

builder.queryField('minor', (t) =>
    t.prismaField({
        type: MinorType,
        args: {
            id: t.arg.id(),
        },
        authScopes: () => true,
        async resolve(query, _, {id}) {
            return prisma.minor.findUniqueOrThrow({
                ...query,
                where: { id },
            });
        },
    })
);

builder.mutationField('upsertMinor', (t) =>
    t.prismaField({
        type: MinorType,
        args: {
            id: t.arg.id({ required: false }),
            name: t.arg.string(),
            majorsUids: t.arg.stringList(),
            yearTier: t.arg.int(),
        },
        async authScopes(_, {}, { user }) {
            return Boolean(user?.admin)
        },
        async resolve(query, _, { id, majorsUids, ...data }, { user }) {
            const upsertData = {
               ...data,
               connect: majorsUids.map((uid) => ({ uid })),
            };
            return prisma.minor.upsert({
                ...query,
                where: { id: id ?? '' },
                create: {
                    ...upsertData,
                    uid: 
                },
                update: upsertData,
            });
        },
    })
);

builder.mutationField('deleteMinor', (t) =>
    t.prismaField({
        type: 'Boolean',
        args: {
            id: t.arg.id(),
        },
        async authScopes(_, { id }, { user }) {
            // todo
        },
        async resolve(_query, _, { id }, { user }) {
            await prisma.minor.delete({
                where: { id },
            });
            return true;
        },
    })
);
