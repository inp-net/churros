import { builder, log, prisma, UnauthorizedError } from '#lib';
import { unlinkSync } from 'node:fs';
import path from 'node:path/posix';
import { ZodError } from 'zod';
import { canEditPage, pageFilePath, PageType } from '../index.js';

builder.mutationField('removeFileFromPage', (t) =>
  t.prismaField({
    type: PageType,
    description: "Supprimer un fichier d'une page.",
    errors: { types: [Error, ZodError] },
    args: {
      page: t.arg.globalID({ for: PageType }),
      filename: t.arg.string(),
    },
    async authScopes(_, { page: { id } }, { user }) {
      if (!user) return false;
      const page = await prisma.page.findUnique({
        where: { id },
        include: {
          studentAssociation: true,
          group: true,
        },
      });

      if (!page) return false;
      return canEditPage(page, user);
    },
    async resolve(query, _, { page: { id }, filename }, { user }) {
      if (!user) throw new UnauthorizedError();

      const page = await prisma.page.findUniqueOrThrow({
        where: { id },
      });

      filename = path.basename(filename).trim();

      await log('pages', 'remove-file/start', { filename }, id, user);

      const { filepath, relativePath } = pageFilePath(page, { name: filename });

      try {
        unlinkSync(filepath);
        await log('pages', 'remove-file/ok', { filepath, relativePath }, id, user);
      } catch (error) {
        await log(
          'pages',
          'remove-file/error',
          { filepath, relativePath, error: error?.toString() ?? 'undefined' },
          id,
          user,
        );
      }

      return prisma.page.update({
        ...query,
        where: { id: page.id },
        data: {
          files: {
            set: page.files.filter((file) => file !== relativePath),
          },
        },
      });
    },
  }),
);
