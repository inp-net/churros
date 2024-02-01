import { builder, prisma } from '#lib';

/** Deletes a group. */
builder.mutationField('deleteGroup', (t) =>
  t.field({
    type: 'Boolean',
    args: { uid: t.arg.string() },
    authScopes: (_, { uid }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ group, president }) => president && group.uid === uid),
      ),
    async resolve(_, { uid }, { user }) {
      await prisma.group.delete({ where: { uid } });
      await prisma.logEntry.create({
        data: {
          area: 'group',
          action: 'delete',
          target: uid,
          message: `${uid} a été supprimé`,
          user: { connect: { id: user?.id } },
        },
      });
      return true;
    },
  }),
);
