import { builder, prisma } from '#lib';
import { prismaQueryOnClubBoard } from '#modules/groups';

import { StudentAssociationType } from '../index.js';

builder.prismaObjectField('User', 'contributesTo', (t) =>
  t.prismaField({
    type: [StudentAssociationType],
    nullable: true,
    async resolve(query, { id }, _, { user }) {
      if (!user) return null;
      if (!user.admin && user.adminOfStudentAssociations.length === 0) return null;
      return prisma.studentAssociation.findMany({
        ...query,
        where: {
          ...(user.admin
            ? {}
            : {
                OR: [
                  {
                    admins: {
                      some: {
                        id: user.id,
                      },
                    },
                  },
                  {
                    groups: {
                      some: {
                        members: {
                          some: {
                            AND: [{ memberId: user.id }, prismaQueryOnClubBoard()],
                          },
                        },
                      },
                    },
                  },
                ],
              }),
          contributionOptions: {
            some: {
              contributions: {
                some: {
                  userId: id,
                  paid: true,
                },
              },
            },
          },
        },
      });
    },
  }),
);
