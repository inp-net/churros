import { builder, prisma } from '#lib';

import { GodparentRequestType } from '../index.js';

builder.queryField('godparentRequests', (t) =>
  t.prismaField({
    type: [GodparentRequestType],
    authScopes: { admin: true, studentAssociationAdmin: true },
    async resolve(query, _, {}, { user }) {
      if (user?.admin)
        return prisma.godparentRequest.findMany({ ...query, orderBy: { updatedAt: 'desc' } });

      return prisma.godparentRequest.findMany({
        ...query,
        orderBy: { updatedAt: 'desc' },
        where: {
          godparent: {
            major: {
              schools: {
                some: {
                  studentAssociations: {
                    some: {
                      id: {
                        in: user?.adminOfStudentAssociations.flatMap(
                          (association) => association.id,
                        ),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    },
  }),
);
