import { builder, log, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { GroupMemberType } from '#modules/groups/types';
import { canEditGroupMembers } from '#modules/groups/utils';
import { GroupMemberInput } from '../types/group-member-input.js';

builder.mutationField('updateGroupMember', (t) =>
  t.prismaField({
    type: GroupMemberType,
    description: "Mettre à jour un membre d'un groupe",
    errors: {},
    args: {
      group: t.arg({ type: UIDScalar }),
      user: t.arg({ type: UIDScalar }),
      input: t.arg({ type: GroupMemberInput }),
    },
    async authScopes(_, { group: groupUid }, { user }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
        include: canEditGroupMembers.prismaIncludes,
      });
      return canEditGroupMembers(user, group);
    },
    async resolve(query, _, { group: groupUid, user: targetUserUid, input }, { user: me }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
      });
      const targetUser = await prisma.user.findUniqueOrThrow({
        where: { uid: targetUserUid },
      });
      await log('memberships', 'update', { groupUid, targetUserUid, input }, group.id, me);
      return prisma.groupMember.update({
        ...query,
        where: {
          groupId_memberId: {
            groupId: group.id,
            memberId: targetUser.id,
          },
        },
        data: {
          title: input.title ?? undefined,
          president: input.president ?? undefined,
          treasurer: input.treasurer ?? undefined,
          vicePresident: input.vicePresident ?? undefined,
          secretary: input.secretary ?? undefined,
          canEditMembers: input.canEditMembers ?? undefined,
          canEditArticles: input.canEditArticles ?? undefined,
          canScanEvents: input.canScanEvents ?? undefined,
        },
      });
    },
  }),
);
