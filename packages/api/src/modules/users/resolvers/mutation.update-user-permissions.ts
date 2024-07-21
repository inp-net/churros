import { builder, log, objectValuesFlat, prisma, purgeUserSessions } from '#lib';

import { userIsAdminOf } from '#permissions';
import { UserType } from '../index.js';

/**
 * @TODO: implement can edit groups and studentAssociationsAdmin
 */
builder.mutationField('updateUserPermissions', (t) =>
  t.prismaField({
    type: UserType,
    args: {
      uid: t.arg.string(),
      canAccessDocuments: t.arg.boolean(),
    },
    async authScopes(_, { uid }, { user }) {
      const studentAssociationIds = objectValuesFlat(
        await prisma.user.findUniqueOrThrow({
          where: { uid },
          select: {
            major: {
              select: {
                schools: {
                  select: {
                    studentAssociations: {
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        }),
      );

      return userIsAdminOf(user, studentAssociationIds);
    },
    async resolve(query, _, { uid, canAccessDocuments }, { user }) {
      purgeUserSessions(uid);
      const userUpdated = await prisma.user.update({
        ...query,
        where: { uid },
        data: { canAccessDocuments },
      });
      await log('permission', 'update', { userUpdated, canAccessDocuments }, userUpdated.id, user);
      return userUpdated;
    },
  }),
);
