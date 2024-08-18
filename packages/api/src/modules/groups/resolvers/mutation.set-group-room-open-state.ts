import { builder, log, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { GroupType } from '#modules/groups';
import { canSetGroupRoomOpenState } from '#modules/groups/utils';

builder.mutationField('setGoupRoomOpenState', (t) =>
  t.prismaField({
    type: GroupType,
    description: "Changer si la salle d'un groupe est fermée ou ouverte",
    args: {
      group: t.arg({ type: UIDScalar, description: "L'uid du groupe" }),
      open: t.arg.boolean({
        description: 'Vrai si on veut indiquer que le local est maintenant ouvert ',
      }),
    },
    async authScopes(_, { group: uid }, { user }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid },
      });

      return canSetGroupRoomOpenState(user, group);
    },
    async resolve(query, _, { group: uid, open }, { user }) {
      await log('groups', 'set-room', { open, group: uid }, uid, user);

      return await prisma.group.update({
        ...query,
        where: { uid },
        data: { roomIsOpen: open },
      });
    },
  }),
);
