// TODO rename to user.services (services available to a user)
import { builder, prisma } from '#lib';

import { ServiceType } from '../index.js';

builder.queryField('userServices', (t) =>
  t.prismaField({
    type: [ServiceType],
    async resolve(query, _, {}, { user: me }) {
      if (!me) return [];

      const services = await prisma.service.findMany({
        ...query,
        where: {
          studentAssociation: {
            school: {
              uid: {
                in: me.major?.schools.map((school) => school.uid),
              },
            },
          },
        },
        include: {
          group: true,
        },
        orderBy: [{ importance: 'desc' }, { name: 'asc' }],
      });
      return services;
    },
  }),
);
