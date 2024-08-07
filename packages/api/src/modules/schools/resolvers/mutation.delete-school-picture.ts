import { builder, prisma, storageRoot } from '#lib';
import { GraphQLError } from 'graphql';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

builder.mutationField('deleteSchoolPicture', (t) =>
  t.field({
    type: 'String',
    args: {
      id: t.arg.string(),
    },
    authScopes: (_, __, { user }) => Boolean(user?.admin),
    async resolve(_, { id }, { user }) {
      if (!user?.admin) throw new GraphQLError('You do not have the rights to delete this picture');

      const result = await prisma.school.findUniqueOrThrow({
        where: { id },
        select: { pictureFile: true },
      });

      if (!result.pictureFile) throw new GraphQLError('No picture to delete');
      const root = storageRoot();
      if (result.pictureFile) await unlink(path.join(root, result.pictureFile));
      await prisma.school.update({
        where: { id },
        data: { pictureFile: '' },
      });

      return result.pictureFile;
    },
  }),
);
