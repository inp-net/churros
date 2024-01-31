import { builder, prisma } from '#lib';

import { ServiceType } from '../index.js';
// TODO split into  group.services, student-association.services, school.services and query.all-services for admins

builder.queryField('services', (t) =>
  t.prismaField({
    type: [ServiceType],
    args: {
      schoolUid: t.arg.string({ required: false }),
      groupUid: t.arg.string({ required: false }),
      studentAssociationUid: t.arg.string({ required: false }),
    },
    async resolve(query, _, { schoolUid, groupUid, studentAssociationUid }) {
      const services = await prisma.service.findMany({
        ...query,
        where: {
          school: { uid: schoolUid ?? undefined },
          group: { uid: groupUid ?? undefined },
          studentAssociation: { uid: studentAssociationUid },
        },
        orderBy: [{ importance: 'desc' }, { name: 'asc' }],
      });
      return services;
    },
  }),
);
