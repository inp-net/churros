import { builder, prisma, purgeUserSessions } from '#lib';
import { removeMemberFromGroupMailingList, updateMemberBoardLists } from '#modules/mails';

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
      const { uid, email } = await prisma.user.findUniqueOrThrow({
        where: { id: memberId },
        select: { uid: true, email: true },
      });

      const { type } = await prisma.group.findUniqueOrThrow({
        where: { id: groupId },
        select: { type: true },
      });

      await removeMemberFromGroupMailingList(groupId, email);
      await updateMemberBoardLists(memberId, groupId, type);

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
