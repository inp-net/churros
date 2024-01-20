import { builder, prisma } from '#lib';
import { FileScalar } from '#modules/global';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { documentFilePath } from '../index.js';

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
      return Boolean(user?.admin || document.uploaderId === user?.id);
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
