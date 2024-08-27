import { builder, freeUidValidator, log, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { GroupEnumType, GroupType } from '#modules/groups/types';
import { canCreateGroup } from '#modules/groups/utils';

builder.mutationField('createGroup', (t) =>
  t.prismaField({
    type: GroupType,
    errors: {},
    description: 'Créer un nouveau groupe',
    args: {
      studentAssociation: t.arg({
        type: UIDScalar,
        description: 'AE de rattachement du groupe',
      }),
      uid: t.arg({
        type: UIDScalar,
        validate: freeUidValidator,
      }),
      name: t.arg.string({
        validate: { maxLength: 50 },
      }),
      type: t.arg({
        type: GroupEnumType,
        defaultValue: 'Group',
      }),
    },
    async authScopes(_, { studentAssociation, type }, { user }) {
      return canCreateGroup(user, {
        studentAssociationUid: studentAssociation,
        type,
      });
    },
    async resolve(query, _, input, { user }) {
      await log('groups', 'create', input, input.uid, user);
      return prisma.group.create({
        ...query,
        data: {
          ...input,
          studentAssociation: { connect: { uid: input.studentAssociation } },
          color: '',
        },
      });
    },
  }),
);
