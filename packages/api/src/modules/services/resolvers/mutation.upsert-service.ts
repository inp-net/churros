import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { GraphQLError } from 'graphql';
import { LogoSourceTypeEnum, ServiceType } from '../index.js';
import { canCreateServicesOnStudentAssociation, canEditService } from '../utils/permissions.js';

builder.mutationField('upsertService', (t) =>
  t.prismaField({
    type: ServiceType,
    errors: {},
    deprecationReason: "Use 'upsertServiceV2' instead",
    args: {
      id: t.arg({ type: LocalID, required: false }),
      name: t.arg.string(),
      url: t.arg.string(),
      description: t.arg.string(),
      logo: t.arg.string(),
      logoSourceType: t.arg({ type: LogoSourceTypeEnum }),
      schoolUid: t.arg.string({ required: false }),
      groupUid: t.arg.string({ required: false }),
      studentAssociationUid: t.arg.string({ required: false }),
      importance: t.arg.int({ required: false, defaultValue: 0, validate: { min: 0 } }),
    },
    async authScopes(_, { id, studentAssociationUid }, { user }) {
      if (id) {
        const service = await prisma.service.findUniqueOrThrow({
          where: {
            id: ensureGlobalId(id, 'Service'),
          },
          include: canEditService.prismaIncludes,
        });
        return canEditService(user, service);
      }

      if (studentAssociationUid) {
        const studentAssociation = await prisma.studentAssociation.findUniqueOrThrow({
          where: {
            uid: studentAssociationUid,
          },
          include: canCreateServicesOnStudentAssociation.prismaIncludes,
        });
        return canCreateServicesOnStudentAssociation(user, studentAssociation);
      }

      // TODO allow non admins to create new services that are linked to groups only?
      return Boolean(user?.admin);
    },
    async resolve(
      query,
      _,
      {
        id: localID,
        name,
        url,
        description,
        logo,
        logoSourceType,
        schoolUid,
        groupUid,
        studentAssociationUid,
        importance,
      },
      { user },
    ) {
      const id = localID ? ensureGlobalId(localID, 'Service') : undefined;
      if (!user?.admin) throw new GraphQLError('Unauthorized');
      const service = await prisma.service.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          name,
          url,
          description,
          logo,
          logoSourceType,
          school: schoolUid ? { connect: { uid: schoolUid } } : undefined,
          group: groupUid ? { connect: { uid: groupUid } } : undefined,
          studentAssociation: studentAssociationUid
            ? { connect: { uid: studentAssociationUid } }
            : undefined,
          importance: importance ?? 0,
        },
        update: {
          name,
          url,
          description,
          logo,
          logoSourceType,
          school: schoolUid ? { connect: { uid: schoolUid } } : { disconnect: true },
          group: groupUid ? { connect: { uid: groupUid } } : { disconnect: true },
          studentAssociation: studentAssociationUid
            ? { connect: { uid: studentAssociationUid } }
            : { disconnect: true },
          importance: importance ?? 0,
        },
      });

      await log('service', 'create', { service }, service.id, user);

      return service;
    },
  }),
);
