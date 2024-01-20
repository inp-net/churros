import { builder, prisma, publish } from '#lib';

builder.mutationField('deleteAnnouncement', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin);
    },
    async resolve(_, { id }, { user }) {
      await prisma.announcement.delete({
        where: { id },
      });
      await prisma.logEntry.create({
        data: {
          area: 'announcements',
          action: 'delete',
          target: id,
          message: `Announcement ${id} deleted`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      publish(id, 'deleted', id);
      return true;
    },
  }),
);
