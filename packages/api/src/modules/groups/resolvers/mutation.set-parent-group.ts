import { builder, log, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { GroupType } from '#modules/groups/types';
import { canChangeParentGroup } from '#modules/groups/utils';

builder.mutationField('setParentGroup', (t) =>
  t.prismaField({
    type: GroupType,
    errors: {},
    description: "Changer le groupe parent d'un groupe",
    args: {
      child: t.arg({ type: UIDScalar }),
      parent: t.arg({
        type: UIDScalar,
        required: false,
        description: "Le groupe parent. Null pour déconnecter d'un groupe parent",
      }),
    },
    async authScopes(_, { child, parent }, { user }) {
      return canChangeParentGroup(user, {
        child: await prisma.group.findUniqueOrThrow({
          where: { uid: child },
          include: canChangeParentGroup.prismaIncludes,
        }),
        parent: parent
          ? await prisma.group.findUniqueOrThrow({
              where: { uid: parent },
              include: canChangeParentGroup.prismaIncludes,
            })
          : null,
      });
    },
    async resolve(query, _, { child, parent: parentUid }, { user }) {
      if (!parentUid) {
        await log('groups', 'detach-from-parent-group', { child, parent: null }, child, user);
        return prisma.group.update({
          ...query,
          where: { uid: child },
          data: {
            parent: { disconnect: true },
            familyRoot: { connect: { uid: child } },
          },
        });
      }

      const parent = await prisma.group.findUniqueOrThrow({
        where: { uid: parentUid },
      });

      await log('groups', 'set-parent-group', { child, parent }, child, user);
      return prisma.group.update({
        ...query,
        where: { uid: child },
        data: {
          parentId: parent.id,
          familyId: parent.familyId,
        },
      });
    },
  }),
);
