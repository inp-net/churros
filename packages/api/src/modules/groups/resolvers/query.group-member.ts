import { builder, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { GroupMemberType } from '#modules/groups/types';

builder.queryField('groupMember', (t) =>
  t.prismaField({
    type: GroupMemberType,
    nullable: true,
    args: {
      user: t.arg({ type: UIDScalar }),
      group: t.arg({ type: UIDScalar }),
    },
    async resolve(query, _, { user: userUid, group: groupUid }) {
      return prisma.groupMember.findFirst({
        ...query,
        where: {
          group: { uid: groupUid },
          member: { uid: userUid },
        },
      });
    },
  }),
);
