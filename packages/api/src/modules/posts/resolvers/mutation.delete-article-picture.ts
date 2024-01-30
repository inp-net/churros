import { builder, prisma } from '#lib';

import { unlink } from 'node:fs/promises';
import path from 'node:path';

builder.mutationField('deleteArticlePicture', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const article = await prisma.article.findUniqueOrThrow({
        where: { id },
      });
      if (user?.canEditGroups) return true;

      return Boolean(
        // Who can edit this article?
        // Admins
        user?.admin ||
          // The author
          user?.id === article.authorId ||
          // Other authors of the group
          user?.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId,
          ),
      );
    },
    async resolve(_, { id }, { user }) {
      const { pictureFile } = await prisma.article.findUniqueOrThrow({
        where: { id },
        select: { pictureFile: true },
      });

      const root = new URL(process.env.STORAGE).pathname;

      if (pictureFile) await unlink(path.join(root, pictureFile));
      await prisma.article.update({ where: { id }, data: { pictureFile: '' } });
      await prisma.logEntry.create({
        data: {
          area: 'article',
          action: 'delete',
          target: id,
          message: `Article ${id} picture deleted`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return true;
    },
  }),
);
