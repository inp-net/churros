import { builder, prisma } from '#lib';
import { userIsOnBoardOf } from '#permissions';

builder.mutationField('deleteBarWeek', (t) =>
  t.field({
    type: 'Boolean',
    args: { id: t.arg.id() },
    authScopes(_, {}, { user }) {
      // Only members of a certain group(s) can upsert a bar week
      const foyGroupsUids = process.env['FOY_GROUPS']?.split(',') ?? [];
      return Boolean(user?.admin || foyGroupsUids.some((uid) => userIsOnBoardOf(user, uid)));
    },
    async resolve(_, { id }, { user }) {
      await prisma.barWeek.delete({ where: { id } });
      await prisma.logEntry.create({
        data: {
          area: 'bar-week',
          action: 'delete',
          target: id,
          message: `Bar week ${id} deleted`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return true;
    },
  }),
);
