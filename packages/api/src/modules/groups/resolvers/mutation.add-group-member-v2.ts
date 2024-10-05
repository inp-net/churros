import { builder, log, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { GroupMemberType } from '#modules/groups/types';
import { canEditGroupMembers } from '#modules/groups/utils';

builder.mutationField('addGroupMemberV2', (t) =>
  t.prismaField({
    type: GroupMemberType,
    errors: {},
    description: "Ajouter quelqu'un à un groupe",
    args: {
      group: t.arg({ type: UIDScalar }),
      user: t.arg({ type: UIDScalar }),
      title: t.arg.string({ defaultValue: 'Membre' }),
    },
    async authScopes(_, { group: groupUid }, { user }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
        include: canEditGroupMembers.prismaIncludes,
      });
      return canEditGroupMembers(user, group);
    },
    async resolve(query, _, { group: groupUid, user: targetUserUid, title }, { user: me }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
      });
      await log('memberships', 'add', { groupUid, targetUserUid, title }, group.id, me);
      return prisma.groupMember.create({
        ...query,
        data: {
          group: { connect: { uid: groupUid } },
          member: { connect: { uid: targetUserUid } },
          title,
        },
      });
    },
  }),
);
