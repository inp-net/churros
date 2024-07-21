import { builder, log, prisma, publish } from '#lib';

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
      await log('announcements', 'delete', { message: `Announcement ${id} deleted` }, id, user);
      publish(id, 'deleted', id);
      return true;
    },
  }),
);
