import { builder, log, prisma, purgeSessionsUser } from '#lib';
import { UIDScalar } from '#modules/global';
import { GroupMemberType } from '#modules/groups/types';
import { canEditGroupMembers } from '#modules/groups/utils';
import { removeMemberFromGroupMailingList, updateMemberBoardLists } from '#modules/mails';

/** Removes a member from a group. */
builder.mutationField('deleteGroupMember', (t) =>
  t.prismaField({
    type: GroupMemberType,
    errors: {},
    args: {
      user: t.arg({ type: UIDScalar }),
      group: t.arg({ type: UIDScalar }),
    },
    async authScopes(_, { group: groupUid }, { user }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
        include: canEditGroupMembers.prismaIncludes,
      });
      return canEditGroupMembers(user, group);
    },
    async resolve(query, _, { user: targetUserUid, group: groupUid }, { user: me }) {
      const member = await prisma.user.findUniqueOrThrow({
        where: { uid: targetUserUid },
        select: { uid: true, email: true, id: true },
      });

      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
        select: { type: true, id: true },
      });

      try {
        await removeMemberFromGroupMailingList(group.id, member.email);
        await updateMemberBoardLists(member.id, group.id, group.type);
      } catch (error) {
        await log('mails', 'remove-member/error', { error }, group.id, me);
      }

      purgeSessionsUser(member.uid);
      await log(
        'group-member',
        'delete',
        { message: `${member.uid} a été supprimé·e de ${group.id}` },
        group.id,
        me,
      );
      return prisma.groupMember.delete({
        ...query,
        where: { groupId_memberId: { groupId: group.id, memberId: member.id } },
      });
    },
  }),
);
