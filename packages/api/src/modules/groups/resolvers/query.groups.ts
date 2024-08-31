import { builder, prisma } from '#lib';

import { GroupEnumType, GroupType } from '../index.js';

builder.queryField('groups', (t) =>
  t.prismaField({
    type: [GroupType],
    args: {
      types: t.arg({ type: [GroupEnumType], required: false }),
      unlisted: t.arg.boolean({
        defaultValue: false,
        description: 'Inclures les groupes non répertoriés',
      }),
    },
    resolve: async (query, _, { types, unlisted }, { user }) =>
      prisma.group.findMany({
        ...query,
        where: {
          ...(types ? { type: { in: types } } : {}),
          ...(unlisted ? {} : { unlisted: false }),
          ...(user?.admin
            ? {}
            : {
                studentAssociation: {
                  school: {
                    OR: [
                      { id: { in: user?.major?.schools.map(({ id }) => id) ?? [] } },
                      { uid: process.env.PUBLIC_SCHOOL_UID },
                    ],
                  },
                },
              }),
        },
        orderBy: { name: 'asc' },
      }),
  }),
);
