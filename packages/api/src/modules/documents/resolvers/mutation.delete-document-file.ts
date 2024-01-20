import { builder, prisma } from '#lib';

import { unlinkSync } from 'node:fs';
import { join } from 'node:path';

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
