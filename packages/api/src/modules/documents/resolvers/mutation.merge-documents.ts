import { builder, log, prisma } from '#lib';

import { GraphQLError } from 'graphql';
import { rename } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { DocumentType, documentFilePath } from '../index.js';

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
