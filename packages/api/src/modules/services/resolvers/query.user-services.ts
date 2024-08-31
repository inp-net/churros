import { builder, prisma } from '#lib';
import { ServiceType, ServiceTypePrismaIncludes } from '../index.js';

builder.queryField('userServices', (t) =>
  t.prismaField({
    type: [ServiceType],
    deprecationReason: 'Use `services(mine: true)` instead',
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
        include: ServiceTypePrismaIncludes,
        orderBy: [{ importance: 'desc' }, { name: 'asc' }],
      });
      return services;
    },
  }),
);
