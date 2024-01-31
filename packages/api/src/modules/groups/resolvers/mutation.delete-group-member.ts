import { builder, prisma, purgeUserSessions } from '#lib';

/** Removes a member from a group. */
builder.mutationField('deleteGroupMember', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      memberId: t.arg.id(),
      groupId: t.arg.id(),
    },
    authScopes: (_, { memberId, groupId }, { user }) =>
      Boolean(
        memberId === user?.id ||
          user?.canEditGroups ||
          user?.groups.some(({ groupId: id, canEditMembers }) => canEditMembers && groupId === id),
      ),
    async resolve(_, { memberId, groupId }, { user: me }) {
      const { uid } = await prisma.user.findUniqueOrThrow({
        where: { id: memberId },
        select: { uid: true },
      });
      purgeUserSessions(uid);
      await prisma.groupMember.delete({ where: { groupId_memberId: { groupId, memberId } } });
      await prisma.logEntry.create({
        data: {
          area: 'group-member',
          action: 'delete',
          target: groupId,
          message: `${uid} a été supprimé·e de ${groupId}`,
          user: me ? { connect: { id: me.id } } : undefined,
        },
      });
      return true;
    },
  }),
);
