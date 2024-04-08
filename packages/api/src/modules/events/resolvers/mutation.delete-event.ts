import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';

builder.mutationField('deleteEvent', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
        include: { managers: true },
      });
      return Boolean(
        user?.admin || event.managers.some(({ userId, canEdit }) => userId === user?.id && canEdit),
      );
    },
    async resolve(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
        include: { beneficiary: true },
      });

      if (event.beneficiary)
        {throw new GraphQLError(
          'Tu ne peux pas supprimer un événement où des places sont réservées.',
        );}

      const { pictureFile } = await prisma.event.findUniqueOrThrow({
        where: { id },
        select: { pictureFile: true },
      });

      const root = new URL(process.env.STORAGE).pathname;

      if (pictureFile) await unlink(join(root, pictureFile));
      await prisma.event.delete({
        where: { id },
      });
      await prisma.logEntry.create({
        data: {
          area: 'event',
          action: 'delete',
          target: id,
          message: `Deleted event ${id}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return true;
    },
  }),
);
