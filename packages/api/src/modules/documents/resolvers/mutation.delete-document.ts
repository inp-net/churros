import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { join } from 'lodash';
import { rm, rmdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { log } from '../../logs/old.js';
import {} from '../index.js';

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
        paths.map(async (path) => await rm(join(new URL(process.env.STORAGE).pathname, path))),
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
