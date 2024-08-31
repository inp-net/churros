import { builder, log, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { GroupProfileInput, GroupType } from '#modules/groups/types';
import { canEditGroup } from '#modules/groups/utils';

builder.mutationField('updateGroupProfile', (t) =>
  t.prismaField({
    type: GroupType,
    errors: {},
    description: "Mettre à jour le profil d'un groupe",
    args: {
      uid: t.arg({ type: UIDScalar }),
      profile: t.arg({ type: GroupProfileInput }),
    },
    async authScopes(_, { uid }, { user }) {
      return canEditGroup(
        user,
        await prisma.group.findUniqueOrThrow({
          where: { uid },
          include: canEditGroup.prismaIncludes,
        }),
      );
    },
    async resolve(query, _, { uid, profile }, { user }) {
      await log('groups', 'update-profile', { uid, profile }, uid, user);
      return prisma.group.update({
        ...query,
        where: {
          uid,
        },
        data: {
          name: profile.name ?? undefined,
          description: profile.shortDescription ?? undefined,
          longDescription: profile.longDescription ?? undefined,
          address: profile.room ?? undefined,
          related: profile.relatedGroups
            ? {
                set: profile.relatedGroups.map((uid) => ({ uid })),
              }
            : undefined,
          color: profile.unsetColor ? '' : (profile.color ?? undefined),
          email: profile.unsetEmail ? '' : (profile.email ?? undefined),
        },
      });
    },
  }),
);
