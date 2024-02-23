import { builder, log, prisma } from '#lib';

import { rm, rmdir } from 'node:fs/promises';
import path, { dirname } from 'node:path';

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
        paths.map(
          async (filepath) => await rm(path.join(new URL(process.env.STORAGE).pathname, filepath)),
        ),
      );
      try {
        if (paths.length > 0)
          await rmdir(dirname(path.join(new URL(process.env.STORAGE).pathname, paths[0]!)));
      } catch {}

      await prisma.document.delete({
        where: { id },
      });
      return true;
    },
  }),
);
