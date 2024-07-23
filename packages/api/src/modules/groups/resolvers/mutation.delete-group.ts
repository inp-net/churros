import { builder, log, objectValuesFlat, prisma } from '#lib';
import { userIsAdminOf, userIsGroupEditorOf } from '#permissions';

/** Deletes a group. */
builder.mutationField('deleteGroup', (t) =>
  t.field({
    type: 'Boolean',
    args: { uid: t.arg.string() },
    async authScopes(_, { uid }, { user }) {
      const studentAssociationIds = objectValuesFlat(
        await prisma.group.findUniqueOrThrow({
          where: { uid },
          select: { studentAssociationId: true },
        }),
      );

      return Boolean(
        userIsAdminOf(user, studentAssociationIds) ||
          userIsGroupEditorOf(user, studentAssociationIds) ||
          user?.groups.some(({ group, president }) => president && group.uid === uid),
      );
    },
    async resolve(_, { uid }, { user }) {
      await prisma.group.delete({ where: { uid } });
      await log('group', 'delete', { message: `${uid} a été supprimé` }, uid, user);
      return true;
    },
  }),
);
