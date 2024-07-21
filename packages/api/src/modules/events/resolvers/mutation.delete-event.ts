import { log, builder, objectValuesFlat, prisma } from '#lib';
import { userIsAdminOf } from '#permissions';

builder.mutationField('deleteEvent', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
        include: { managers: true, group: true },
      });
      return Boolean(
        userIsAdminOf(user, objectValuesFlat(event.group)) ||
          event.managers.some(({ userId, canEdit }) => userId === user?.id && canEdit),
      );
    },
    async resolve(_, { id }, { user }) {
      await prisma.event.delete({
        where: { id },
      });
      await log('event', 'delete', { message: `Deleted event ${id}` }, id, user);
      return true;
    },
  }),
);
