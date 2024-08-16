import { builder, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { queryFromInfo } from '@pothos/plugin-prisma';
import { ProfileType } from '../index.js';

builder.queryField('profile', (t) =>
  t.field({
    type: ProfileType,
    nullable: true,
    args: {
      uid: t.arg({
        type: UIDScalar,
      }),
    },
    // @ts-expect-error type includes are not propgated thru queryFromInfo, it seems
    async resolve(_, { uid }, context, info) {
      const query = <T extends string>(typeName: T) =>
        queryFromInfo({
          context,
          info,
          typeName,
        });
      return (
        (await prisma.user.findUnique({ ...query('User'), where: { uid } })) ??
        (await prisma.group.findUnique({ ...query('Group'), where: { uid } })) ??
        (await prisma.studentAssociation.findUnique({
          ...query('StudentAssociation'),
          where: { uid },
        })) ??
        (await prisma.school.findUnique({ ...query('School'), where: { uid } })) ??
        (await prisma.major.findUnique({ ...query('Major'), where: { uid } }))
      );
    },
  }),
);
