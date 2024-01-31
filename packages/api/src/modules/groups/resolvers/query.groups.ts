import { builder, prisma } from '#lib';

import { GroupEnumType, GroupType } from '../index.js';

builder.queryField('groups', (t) =>
  t.prismaField({
    type: [GroupType],
    args: {
      types: t.arg({ type: [GroupEnumType], required: false }),
    },
    resolve: async (query, _, { types }, { user }) =>
      prisma.group.findMany({
        ...query,
        where: {
          ...(types ? { type: { in: types } } : {}),
          ...(user?.admin
            ? {}
            : {
                studentAssociation: {
                  school: {
                    OR: [
                      {
                        id: {
                          in: user?.major?.schools.map(({ id }) => id) ?? [],
                        },
                      },
                      {
                        uid: process.env.PUBLIC_SCHOOL_UID,
                      },
                    ],
                  },
                },
              }),
        },
        orderBy: { name: 'asc' },
      }),
  }),
);
