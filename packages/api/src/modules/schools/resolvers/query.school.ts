import { builder, prisma } from '#lib';

import { SchoolType } from '../index.js';

builder.queryField('school', (t) =>
  t.prismaField({
    type: SchoolType,
    args: {
      uid: t.arg.string(),
    },
    async resolve(query, _, { uid }) {
      const school = await prisma.school.findUnique({
        ...query,
        where: { uid },
        include: {
          studentAssociations: true,
          services: {
            include: {
              group: true,
            },
          },
        },
      });
      if (!school) throw new Error('School not found');
      return school;
    },
  }),
);
