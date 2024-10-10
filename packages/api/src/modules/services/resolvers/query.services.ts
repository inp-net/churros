import { builder, prisma, TYPENAMES_TO_ID_PREFIXES } from '#lib';
import type { Prisma } from '@churros/db/prisma';
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
      let where: Prisma.ServiceWhereInput = {};

      if (mine && user?.major) {
        const isUserSchool = {
          school: { uid: { in: user.major.schools.map((school) => school.uid) } },
        } as const;

        where = {
          hidden: false,
          // Include services from the user's school and from student associations of the user's school
          OR: [{ studentAssociation: isUserSchool }, isUserSchool],
        };
      } else if (mine) {
        where = {
          hidden: false,
          OR: [
            { group: { isNot: null } },
            { studentAssociation: { isNot: null } },
            { school: { isNot: null } },
          ],
        };
      } else {
        where = {};
      }

      const services = await prisma.service.findMany({
        ...query,
        where,
        include: ServiceTypePrismaIncludes,
        orderBy: [{ importance: 'desc' }, { name: 'asc' }],
      });

      if (mine && user) {
        // Sort pinned services first
        const pinnedServices = await prisma.bookmark.findMany({
          where: {
            userId: user.id,
            path: { startsWith: TYPENAMES_TO_ID_PREFIXES.Service },
          },
          select: { path: true },
        });

        return services.toSorted((a, b) => {
          const aIsPinned = pinnedServices.some((pinned) => pinned.path === a.id);
          const bIsPinned = pinnedServices.some((pinned) => pinned.path === b.id);
          if (aIsPinned && !bIsPinned) return -1;
          if (!aIsPinned && bIsPinned) return 1;
          return 0;
        });
      }

      return services;
    },
  }),
);
