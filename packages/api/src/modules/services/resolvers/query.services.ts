import { builder, prisma } from '#lib';
import { ServiceType, ServiceTypePrismaIncludes } from '../index.js';
// TODO split into  group.services, student-association.services, school.services and query.all-services for admins

builder.queryField('services', (t) =>
  t.prismaField({
    type: [ServiceType],
    args: {
      mine: t.arg.boolean({
        description: "Renvoie uniquement les services intéréssant l'utilisateur·ice connecté·e",
      }),
    },
    async resolve(query, _, { mine }, { user }) {
      const services = await prisma.service.findMany({
        ...query,
        where:
          mine && user
            ? {
                OR: [
                  {
                    studentAssociation: {
                      school: {
                        uid: {
                          in: user.major?.schools.map((school) => school.uid),
                        },
                      },
                    },
                  },
                  {
                    school: {
                      uid: { in: user.major?.schools.map((school) => school.uid) },
                    },
                  },
                ],
              }
            : {
                OR: [
                  { group: { isNot: null } },
                  { studentAssociation: { isNot: null } },
                  { school: { isNot: null } },
                ],
              },
        include: ServiceTypePrismaIncludes,
        orderBy: [{ importance: 'desc' }, { name: 'asc' }],
      });
      return services;
    },
  }),
);
