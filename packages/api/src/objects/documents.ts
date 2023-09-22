import dichotomid from 'dichotomid';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { CommentType } from './comments.js';
import { DateTimeScalar, FileScalar } from './scalars.js';
import { DocumentType as DocumentTypePrisma } from '@prisma/client';
import slug from 'slug';
import { GraphQLError } from 'graphql';
import { join, relative } from 'node:path';
import { unlinkSync, writeFileSync } from 'node:fs';

export const DocumentEnumType = builder.enumType(DocumentTypePrisma, {
    name: 'DocumentType',
})

export const DocumentType = builder.prismaNode('Document', {
    id: { field: 'id' },
    fields: (t) => ({
        createdAt: t.expose('createdAt', { type: DateTimeScalar }),
        updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
        schoolYear: t.exposeInt('schoolYear'),
        title: t.exposeString('title'),
        description: t.exposeString('description'),
        descriptionHtml: t.string({
            resolve: async ({description}) => toHtml(description)
        }),
        subject: t.relation('subject'),
        subjectId: t.exposeID('subjectId'),
        type: t.expose('type', {type: DocumentEnumType }),
        paperPaths: t.exposeStringList('paperPaths', {description: "Liste de chemins vers les fichiers représentant le sujet (ou la fiche de révision)"}),
        solutionPaths: t.exposeStringList('solutionPaths', {description: "Liste de chemins vers les fichiers représentant la correction."}),
        uploader: t.relation('uploader', {nullable: true}),
        uploaderId: t.exposeID('uploaderId', {nullable: true}),
        comments: t.relatedConnection('comments', {
            cursor: 'id',
            type: CommentType,
        })
    }),
});

builder.queryField('documents', (t) =>
    t.prismaConnection({
        type: DocumentType,
        cursor: 'id',
        authScopes(_, { }, { user }) {
            return Boolean(user?.admin || user?.canAccessDocuments)   
        },
        async resolve(query) {
            return prisma.document.findMany({
                ...query,
                orderBy: { updatedAt: 'desc' },
            });
        },
    })
);

builder.queryField('document', (t) =>
    t.prismaField({
        type: DocumentType,
        args: {
            id: t.arg.id(),
        },
        authScopes(_, {}, { user }) {
            return Boolean(user?.admin || user?.canAccessDocuments)
        },
        async resolve(query, _, { id }) {
            return prisma.document.findUniqueOrThrow({
                ...query,
                where: { id },
            });
        },
    })
);

builder.mutationField('upsertDocument', (t) =>
    t.prismaField({
        type: DocumentType,
        errors: {},
        args: {
            id: t.arg.id({ required: false }),
            schoolYear: t.arg.int({ required: true }),
            title: t.arg.string({ required: true }),
            description: t.arg.string({ required: true }),
            subjectUid: t.arg.string({ required: true }),
            type: t.arg({ type: DocumentEnumType, required: true }),
        },
        authScopes(_, {}, { user }) {
            return Boolean(user?.admin || user?.canAccessDocuments)
        },
        async resolve(query, _, { id, subjectUid,  title, schoolYear,  ...data }) {
            const subject = await prisma.subject.findUnique({where: {uid: subjectUid}})
            if (!subject) throw new GraphQLError("Matière introuvable")
    const uidBase = `${slug(title)}${schoolYear ? `-${schoolYear}` : ''}`
    const uidNumber = await dichotomid(async n => !(await prisma.document.findUnique({where: {
        subjectId_uid: {subjectId: subject.id, uid: `${uidBase}${n ? `-${n}` : ''}`},
    }})))
    const uid = `${uidBase}${uidNumber ? `-${uidNumber}` : ''}`
            const upsertData = {
        title, schoolYear,uid,
                ...data, 
                subject: {
                    connect: {id: subject.id}
                }

            };
            return prisma.document.upsert({
                ...query,
                where: { id: id ?? '' },
                create: {...upsertData, uid},
                update: upsertData,
            });
        },
    })
);

builder.mutationField('deleteDocument', (t) =>
    t.field({
        type: 'Boolean',
        args: {
            id: t.arg.id(),
        },
        async authScopes(_, { id }, { user }) {
            const author = await prisma.document.findUnique({where: {id}, select: {uploaderId: true}})
            return Boolean(user?.admin || user?.uid === author?.uploaderId)
        },
        async resolve(_, { id }) {
            await prisma.document.delete({
                where: { id },
            });
            return true;
        },
    })
);

builder.mutationField('uploadDocumentFile', t => t.field({
    type: 'String',
    args: {
        subjectUid: t.arg.string({required: true}),
        documentUid: t.arg.string({required: true}),
        file: t.arg({type: FileScalar, required: true}),
        solution: t.arg.boolean(),
    },
    async authScopes(_, {documentUid, subjectUid}, {user}) {
        const subject = await prisma.subject.findUniqueOrThrow({where:{uid: subjectUid}})
        const document = await prisma.document.findUniqueOrThrow({where: {subjectId_uid: {subjectId: subject.id, uid: documentUid}}})
        return Boolean(user?.admin || document.uploaderId === user?.uid)
    },
    async resolve(_, {subjectUid, documentUid, file, solution}) {
        const subject = await prisma.subject.findUniqueOrThrow({where:{uid: subjectUid}})
        const document = await prisma.document.findUniqueOrThrow({where:{subjectId_uid: {subjectId: subject.id, uid: documentUid}}})
        const buffer = await file.arrayBuffer().then((array) => Buffer.from(array));
        const root = new URL(process.env.STORAGE).pathname;
        const path = join(root, 'documents', subject.uid, document.uid, `${document[solution ? 'solutionPaths' : 'paperPaths'].length}-${file.name}`)
        writeFileSync(path, buffer)

        await prisma.document.update({
            where: {subjectId_uid: {subjectId: subject.id, uid: documentUid}},
            data: {
                [solution ? 'solutionPaths' : 'paperPaths']: {
                    push: relative(root, path)
                }
            }
        })

        return relative(root, path)
    }
}))

builder.mutationField('deleteDocumentFile', t => t.field({
    type: 'Boolean',
    args: {
        subjectUid: t.arg.string({required: true}),
        documentUid: t.arg.string({required: true}),
        filename: t.arg.string({required: true}),
    },
    async authScopes(_, {documentUid, subjectUid}, {user}) {
        const subject = await prisma.subject.findUniqueOrThrow({where:{uid: subjectUid}})
        const document = await prisma.document.findUniqueOrThrow({where: {subjectId_uid: {subjectId: subject.id, uid: documentUid}}})
        return Boolean(user?.admin || document.uploaderId === user?.uid)
    },
    async resolve(_, { documentUid, subjectUid, filename }) {
        const subject = await prisma.subject.findUniqueOrThrow({where:{uid: subjectUid}})
        const document = await prisma.document.findUniqueOrThrow({where:{subjectId_uid: {subjectId: subject.id, uid: documentUid}}})
        const root = new URL(process.env.STORAGE).pathname;
        const path = join(root, 'documents', subject.uid, document.uid, filename)
        try {
            unlinkSync(path)
        } catch {}

        const isSolution = document.solutionPaths.includes(filename)
        await prisma.document.update({
            where: {id: document.id},
            data: {
                [isSolution ? 'solutionPaths' : 'paperPaths']: {
                    set: document[isSolution ? 'solutionPaths' : 'paperPaths'].filter(p => p !== filename)
                }
            }
        })
        return true
    }
}));
