import { builder, log, objectValuesFlat, prisma } from '#lib';

import { userIsAdminOf, userIsGroupEditorOf, userIsMemberOf } from '#permissions';
// TODO rename to update-group-room-open-state

builder.mutationField('updateRoomOpenState', (t) =>
  t.field({
    type: 'Boolean',
    description: "Changer si la salle d'un groupe est fermée ou ouvert",
    args: {
      groupUid: t.arg.string({ description: "L'uid du groupe" }),
      openRoom: t.arg.boolean({
        description: 'Vrai si on veut indiquer que le local est maintenant ouvert ',
      }),
    },
    async authScopes(_, { groupUid }, { user }) {
      const studentAssociationIds = objectValuesFlat(
        await prisma.group.findUniqueOrThrow({
          where: { uid: groupUid },
          select: { studentAssociationId: true },
        }),
      );

      return Boolean(
        userIsAdminOf(user, studentAssociationIds) ||
          userIsGroupEditorOf(user, studentAssociationIds) ||
          userIsMemberOf(user, groupUid),
      );
    },
    async resolve(_, { groupUid, openRoom }, { user }) {
      const { roomIsOpen } = await prisma.group.update({
        where: { uid: groupUid },
        data: { roomIsOpen: openRoom },
      });

      await log('groups', 'set-room', { open: openRoom }, groupUid, user);

      return roomIsOpen;
    },
  }),
);
