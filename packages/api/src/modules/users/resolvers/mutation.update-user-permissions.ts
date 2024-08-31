import { builder, log, objectValuesFlat, prisma, purgeSessionsUser } from '#lib';
import { UIDScalar } from '#modules/global';

import { userIsAdminOf } from '#permissions';
import { UserType } from '../index.js';

builder.mutationField('updateUserPermissions', (t) =>
  t.prismaField({
    type: UserType,
    errors: {},
    args: {
      user: t.arg({ type: UIDScalar }),
      canAccessDocuments: t.arg.boolean({ required: false }),
      canEditGroupsOf: t.arg({
        required: false,
        type: [UIDScalar],
      }),
      adminOf: t.arg({
        required: false,
        type: [UIDScalar],
      }),
    },
    async authScopes(_, { user: uid }, { user }) {
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
    async resolve(query, _, args, { user }) {
      await log('permission', 'update', args, args.user, user);
      purgeSessionsUser(args.user);
      const userUpdated = await prisma.user.update({
        ...query,
        where: { uid: args.user },
        data: {
          canAccessDocuments: args.canAccessDocuments ?? undefined,
          canEditGroups: args.canEditGroupsOf
            ? { set: args.canEditGroupsOf.map((uid) => ({ uid })) }
            : undefined,
          adminOfStudentAssociations: args.adminOf
            ? { set: args.adminOf.map((uid) => ({ uid })) }
            : undefined,
        },
      });
      return userUpdated;
    },
  }),
);
