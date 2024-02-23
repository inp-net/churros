import { builder, prisma } from '#lib';

import { StudentAssociationType } from '../index.js';
// TODO split into user.student-associations, school.student-associations, and query.all-student-associations for admins

builder.queryField('studentAssociation', (t) =>
  t.prismaField({
    type: StudentAssociationType,
    args: {
      uid: t.arg.string(),
    },
    async resolve(query, _, { uid }) {
      return prisma.studentAssociation.findUniqueOrThrow({
        ...query,
        where: { uid },
        include: {
          groups: {
            where: {
              // Type Club or Association
              type: { in: ['Association', 'Club', 'StudentAssociationSection'] },
            },
            orderBy: {
              name: 'asc',
            },
          },
          links: true,
        },
      });
    },
  }),
);
