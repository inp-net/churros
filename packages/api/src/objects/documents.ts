import dichotomid from 'dichotomid';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { CommentType } from './comments.js';
import { DateTimeScalar, FileScalar } from './scalars.js';
import { DocumentType as DocumentTypePrisma } from '@prisma/client';
import slug from 'slug';
import { GraphQLError } from 'graphql';
import { basename, dirname, join, relative } from 'node:path';
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { rename, rm, rmdir } from 'node:fs/promises';
import { log } from './logs.js';

export const DocumentEnumType = builder.enumType(DocumentTypePrisma, {
  name: 'DocumentType',
});

export const DocumentType = builder.prismaNode('Document', {
  id: { field: 'id' },
  fields: (t) => ({
    uid: t.exposeString('uid'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    schoolYear: t.exposeInt('schoolYear'),
    title: t.exposeString('title'),
    description: t.exposeString('description'),
    descriptionHtml: t.string({
      resolve: async ({ description }) => toHtml(description),
    }),
    subject: t.relation('subject', { nullable: true }),
    subjectId: t.exposeID('subjectId', { nullable: true }),
    type: t.expose('type', { type: DocumentEnumType }),
    paperPaths: t.exposeStringList('paperPaths', {
      description:
        'Liste de chemins vers les fichiers représentant le sujet (ou la fiche de révision)',
    }),
    solutionPaths: t.exposeStringList('solutionPaths', {
      description: 'Liste de chemins vers les fichiers représentant la correction.',
    }),
    uploader: t.relation('uploader', { nullable: true }),
    uploaderId: t.exposeID('uploaderId', { nullable: true }),
    comments: t.relatedConnection('comments', {
      cursor: 'id',
      type: CommentType,
      query: {
        orderBy: { createdAt: 'asc' },
      },
    }),
  }),
});

builder.mutationField('mergeDocuments', (t) =>
  t.field({
    type: DocumentType,
    args: {
      from: t.arg.idList({ required: true }),
      into: t.arg.id({ required: true }),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin);
    },
    async resolve(query, { from, into }, { user }) {
      await log('documents', 'merge', { from }, into, user);
      let sources = await prisma.document.findMany({
        where: { id: { in: from } },
        include: { subject: true },
      });
      const target = await prisma.document.findUnique({
        where: { id: into },
        include: { subject: true },
      });
      if (!target) throw new GraphQLError('Document cible introuvable');
      // Move all files to target
      for (const source of sources) {
        for (const filePath of [...source.paperPaths, ...source.solutionPaths]) {
          const root = new URL(process.env.STORAGE).pathname;
          const oldPath = join(root, filePath);
          const newPath = documentFilePath(
            root,
            target.subject,
            {
              ...target,
              paperPaths: [...target.paperPaths, ...sources.flatMap((s) => s.paperPaths)],
              solutionPaths: [...target.solutionPaths, ...sources.flatMap((s) => s.solutionPaths)],
            },
            filePath in source.solutionPaths,
            { name: basename(filePath).replace(/^\d+-/, '') },
          );
          await rename(oldPath, newPath);
          sources = sources.map((s) => ({
            ...s,
            paperPaths: s.paperPaths.map((p) => (p === filePath ? relative(root, newPath) : p)),
            solutionPaths: s.solutionPaths.map((p) =>
              p === filePath ? relative(root, newPath) : p,
            ),
          }));
        }
      }

      await prisma.document.deleteMany({
        where: { id: { in: from } },
      });
      return prisma.document.update({
        ...query,
        where: { id: target.id },
        data: {
          paperPaths: [...target.paperPaths, ...sources.flatMap((s) => s.paperPaths)],
          solutionPaths: [...target.solutionPaths, ...sources.flatMap((s) => s.solutionPaths)],
        },
      });
    },
  }),
);

builder.queryField('documents', (t) =>
  t.prismaConnection({
    type: DocumentType,
    cursor: 'id',
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin || user?.canAccessDocuments);
    },
    async resolve(query) {
      return prisma.document.findMany({
        ...query,
        orderBy: { updatedAt: 'desc' },
      });
    },
  }),
);

builder.queryField('documentsOfSubject', (t) =>
  t.prismaConnection({
    type: DocumentType,
    cursor: 'id',
    args: {
      subjectUid: t.arg.string({ required: true }),
      yearTier: t.arg.int({ required: true }),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin || user?.canAccessDocuments);
    },
    async resolve(query, _, { subjectUid, yearTier }) {
      /* eslint-disable unicorn/no-null */
      const subject = await prisma.subject.findFirstOrThrow({
        where: {
          OR: [
            { uid: subjectUid, yearTier },
            { uid: subjectUid, yearTier: null },
          ],
        },
      });
      /* eslint-enable unicorn/no-null */
      return prisma.document.findMany({
        ...query,
        where: {
          subjectId: subject.id,
        },
        orderBy: [{ type: 'asc' }, { schoolYear: 'desc' }, { title: 'asc' }],
      });
    },
  }),
);

builder.queryField('document', (t) =>
  t.prismaField({
    type: DocumentType,
    args: {
      subjectUid: t.arg.string(),
      subjectYearTier: t.arg.int({ required: true }),
      documentUid: t.arg.string(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin || user?.canAccessDocuments);
    },
    async resolve(query, _, { subjectUid, documentUid, subjectYearTier }) {
      /* eslint-disable unicorn/no-null */
      const subject = await prisma.subject.findFirstOrThrow({
        where: {
          OR: [
            { uid: subjectUid, yearTier: subjectYearTier },
            { uid: subjectUid, yearTier: null },
          ],
        },
      });
      /* eslint-enable unicorn/no-null */
      return prisma.document.findUniqueOrThrow({
        ...query,
        where: {
          subjectId_uid: { subjectId: subject.id, uid: documentUid },
        },
      });
    },
  }),
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
      subjectYearTier: t.arg.int({ required: false }),
      subjectForApprentices: t.arg.boolean({ required: true }),
      type: t.arg({ type: DocumentEnumType, required: true }),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin || user?.canAccessDocuments);
    },
    async resolve(
      query,
      _,
      { id, subjectUid, title, schoolYear, subjectYearTier, subjectForApprentices, ...data },
      { user },
    ) {
      const subject = await prisma.subject.findFirst({
        where: {
          // uid_yearTier_forApprentices: {
          uid: subjectUid,
          yearTier: subjectYearTier,
          forApprentices: subjectForApprentices,
          // },
        },
      });
      if (!subject) throw new GraphQLError('Matière introuvable');
      const uidBase = `${slug(title)}${schoolYear ? `-${schoolYear}` : ''}`;
      const uidNumber = await dichotomid(
        async (n) =>
          !(await prisma.document.findUnique({
            where: {
              subjectId_uid: { subjectId: subject.id, uid: `${uidBase}${n > 1 ? `-${n}` : ''}` },
            },
          })),
      );
      const uid = `${uidBase}${uidNumber > 1 ? `-${uidNumber}` : ''}`;
      const upsertData = {
        title,
        schoolYear,
        ...data,
        subject: {
          connect: { id: subject.id },
        },
      };
      return prisma.document.upsert({
        ...query,
        where: { id: id ?? '' },
        create: { ...upsertData, uid, uploader: { connect: { id: user?.id ?? '' } } },
        update: upsertData,
      });
    },
  }),
);

builder.mutationField('deleteDocument', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const author = await prisma.document.findUnique({
        where: { id },
        select: { uploaderId: true },
      });
      return Boolean(user?.admin || user?.id === author?.uploaderId);
    },
    async resolve(_, { id }, { user }) {
      const document = await prisma.document.findUniqueOrThrow({ where: { id } });
      await log('documents', 'delete', document, id, user);
      const { paperPaths, solutionPaths } = document;
      const paths = [...paperPaths, ...solutionPaths];
      // Delete all comments
      await prisma.comment.deleteMany({ where: { documentId: id } });
      // Delete all files on disk
      await Promise.all(
        paths.map(async (path) => rm(join(new URL(process.env.STORAGE).pathname, path))),
      );
      try {
        if (paths.length > 0)
          await rmdir(dirname(join(new URL(process.env.STORAGE).pathname, paths[0]!)));
      } catch {}

      await prisma.document.delete({
        where: { id },
      });
      return true;
    },
  }),
);

builder.mutationField('uploadDocumentFile', (t) =>
  t.field({
    type: 'String',
    args: {
      documentId: t.arg.id({ required: true }),
      file: t.arg({ type: FileScalar, required: true }),
      solution: t.arg.boolean(),
    },
    async authScopes(_, { documentId }, { user }) {
      const document = await prisma.document.findUniqueOrThrow({
        where: { id: documentId },
      });
      return Boolean(user?.admin || document.uploaderId === user?.uid);
    },
    async resolve(_, { documentId, file, solution }) {
      const document = await prisma.document.findUniqueOrThrow({
        where: { id: documentId },
        include: { subject: true },
      });
      const { subject } = document;
      const buffer = await file.arrayBuffer().then((array) => Buffer.from(array));
      const root = new URL(process.env.STORAGE).pathname;
      const path = documentFilePath(root, subject, document, solution, file);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, buffer);

      await prisma.document.update({
        where: { id: documentId },
        data: {
          [solution ? 'solutionPaths' : 'paperPaths']: {
            push: relative(root, path),
          },
        },
      });

      return relative(root, path);
    },
  }),
);

builder.mutationField('setDocumentFileIsSolution', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      documentId: t.arg.id({ required: true }),
      filename: t.arg.string({ required: true }),
      isSolution: t.arg.boolean({ required: true }),
    },
    async authScopes(_, { documentId }, { user }) {
      const document = await prisma.document.findUniqueOrThrow({
        where: { id: documentId },
      });
      return Boolean(user?.admin || document.uploaderId === user?.uid);
    },
    async resolve(_, { documentId, filename, isSolution }) {
      const document = await prisma.document.findUniqueOrThrow({
        where: { id: documentId },
      });
      await prisma.document.update({
        where: { id: documentId },
        data: {
          // If marking as solution, remove from paperPaths and add to solutionPaths
          ...(isSolution
            ? {
                paperPaths: {
                  set: document.paperPaths.filter((p) => p !== filename),
                },
                // Don't create duplicates
                ...(document.solutionPaths.includes(filename)
                  ? {}
                  : {
                      solutionPaths: {
                        push: filename,
                      },
                    }),
                // The other way around
              }
            : {
                // Don't create duplicates
                ...(document.paperPaths.includes(filename)
                  ? {}
                  : {
                      paperPaths: {
                        push: filename,
                      },
                    }),
                solutionPaths: {
                  set: document.solutionPaths.filter((p) => p !== filename),
                },
              }),
        },
      });
      return true;
    },
  }),
);

builder.mutationField('deleteDocumentFile', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      documentId: t.arg.id({ required: true }),
      filename: t.arg.string({ required: true }),
    },
    async authScopes(_, { documentId }, { user }) {
      const document = await prisma.document.findUniqueOrThrow({
        where: { id: documentId },
      });
      return Boolean(user?.admin || document.uploaderId === user?.id);
    },
    async resolve(_, { documentId, filename }) {
      const document = await prisma.document.findUniqueOrThrow({
        where: { id: documentId },
        include: { subject: true },
      });
      const { subject, uid, solutionPaths, id } = document;
      const root = new URL(process.env.STORAGE).pathname;
      const path = join(root, 'documents', subject?.uid ?? 'unknown', uid, filename);
      try {
        unlinkSync(path);
      } catch {}

      const isSolution = solutionPaths.includes(filename);
      await prisma.document.update({
        where: { id },
        data: {
          [isSolution ? 'solutionPaths' : 'paperPaths']: {
            set: document[isSolution ? 'solutionPaths' : 'paperPaths'].filter(
              (p) => p !== filename,
            ),
          },
        },
      });
      return true;
    },
  }),
);

function documentFilePath(
  root: string,
  subject:
    | { id: string; name: string; uid: string; shortName: string; nextExamAt: Date | null }
    | undefined
    | null,
  document: { uid: string; solutionPaths: string[]; paperPaths: string[] },
  solution: boolean,
  file: { name: string },
) {
  return join(
    root,
    'documents',
    subject?.uid ?? 'unknown',
    document.uid,
    `${document[solution ? 'solutionPaths' : 'paperPaths'].length}-${file.name}`,
  );
}
