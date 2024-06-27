import { builder, log, prisma, UnauthorizedError } from '#lib';
import { FileScalar } from '#modules/global';
import { canEditPage, pageFilePath } from '#modules/pages/utils';
import { GraphQLError } from 'graphql';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path/posix';
import { ZodError } from 'zod';
import { PageType } from '../types/page.js';

builder.mutationField('addFileToPage', (t) =>
  t.prismaField({
    type: PageType,
    description:
      "Ajouter un fichier à une page. Permet notamment d'ajouter des images pour s'en servir dans le contenu de la page.",
    errors: { types: [Error, ZodError] },
    args: {
      page: t.arg.id(),
      file: t.arg({ type: FileScalar }),
    },
    async authScopes(_, { page: pageId }, { user }) {
      if (!user) return false;
      const page = await prisma.page.findUnique({
        where: {
          id: pageId,
        },
        include: {
          studentAssociation: true,
          group: true,
        },
      });

      if (!page) return false;
      return canEditPage(page, user);
    },
    async resolve(query, _, { page: pageId, file }, { user }) {
      if (!user) throw new UnauthorizedError();

      const page = await prisma.page.findUniqueOrThrow({
        where: { id: pageId },
      });

      if (file.name.trim().length === 0 || file.name.trim().length > 255)
        throw new GraphQLError('Le nom du fichier doit faire entre 1 et 255 caractères.');

      await log('pages', 'upload-file/start', { name: file.name }, pageId, user);

      const buffer = await file.arrayBuffer().then((array) => Buffer.from(array));
      const { filepath, relativePath } = pageFilePath(page, file);

      if (page.files.includes(relativePath))
        throw new GraphQLError('Un autre fichier porte déjà le même nom.');

      mkdirSync(path.dirname(filepath), { recursive: true });
      writeFileSync(filepath, buffer);

      await log(
        'pages',
        'upload-file/ok',
        { name: file.name, filepath, relativePath },
        pageId,
        user,
      );
      return prisma.page.update({
        ...query,
        where: { id: page.id },
        data: {
          files: {
            push: relativePath,
          },
        },
      });
    },
  }),
);
