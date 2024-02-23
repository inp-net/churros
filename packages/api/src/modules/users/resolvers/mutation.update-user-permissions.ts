import { builder, prisma, purgeUserSessions } from '#lib';

import { UserType } from '../index.js';

builder.mutationField('updateUserPermissions', (t) =>
  t.prismaField({
    type: UserType,
    args: {
      uid: t.arg.string(),
      canEditGroups: t.arg.boolean(),
      canEditUsers: t.arg.boolean(),
      canAccessDocuments: t.arg.boolean(),
    },
    authScopes: (_, {}, { user }) => Boolean(user?.admin),
    async resolve(query, _, { uid, canEditGroups, canEditUsers, canAccessDocuments }, { user }) {
      purgeUserSessions(uid);
      const userUpdated = await prisma.user.update({
        ...query,
        where: { uid },
        data: { canEditGroups, canEditUsers, canAccessDocuments },
      });
      await prisma.logEntry.create({
        data: {
          area: 'permission',
          action: 'update',
          target: userUpdated.id,
          message: `Updated user ${userUpdated.uid} permissions: ${JSON.stringify({
            canEditGroups,
            canEditUsers,
            canAccessDocuments,
          })}`,
          user: { connect: { id: user?.id } },
        },
      });
      return userUpdated;
    },
  }),
);
