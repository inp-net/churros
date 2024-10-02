import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { ServiceType } from '#modules/services/types';
import { ServiceInput } from '../types/service-input.js';
import { canCreateServicesOnStudentAssociation, canEditService } from '../utils/permissions.js';

builder.mutationField('upsertServiceV2', (t) =>
  t.prismaField({
    type: ServiceType,
    errors: {},
    description: 'Create or update a service',
    args: {
      id: t.arg({ type: LocalID, required: false }),
      input: t.arg({ type: ServiceInput }),
    },
    async authScopes(_, { id, input: { studentAssociation } }, { user }) {
      if (id) {
        const service = await prisma.service.findUniqueOrThrow({
          where: { id: ensureGlobalId(id, 'Service') },
          include: canEditService.prismaIncludes,
        });
        return canEditService(user, service);
      }

      if (studentAssociation) {
        const sa = await prisma.studentAssociation.findUniqueOrThrow({
          where: { uid: studentAssociation },
          include: canCreateServicesOnStudentAssociation.prismaIncludes,
        });
        return canCreateServicesOnStudentAssociation(user, sa);
      }

      return Boolean(user?.admin);
    },
    async resolve(query, _, { id: localID, input }, { user }) {
      const id = localID ? ensureGlobalId(localID, 'Service') : undefined;
      await log('services', id ? 'update' : 'create', { input, id }, id, user);
      if (!id) {
        return prisma.service.create({
          ...query,
          data: {
            name: input.name ?? '',
            url: input.url ?? '',
            description: input.description ?? '',
            importance: input.importance ?? 0,
            logo: input.iconURL ?? '',
            logoSourceType: input.iconURL ? 'ExternalLink' : 'GroupLogo',
            group: input.group ? { connect: { uid: input.group } } : undefined,
            studentAssociation: input.studentAssociation
              ? { connect: { uid: input.studentAssociation } }
              : undefined,
            school: input.school ? { connect: { uid: input.school } } : undefined,
          },
        });
      }

      return prisma.service.update({
        ...query,
        where: { id },
        data: {
          name: input.name ?? undefined,
          url: input.url ?? undefined,
          description: input.description ?? undefined,
          importance: input.importance ?? undefined,
          logo: input.removeIcon ? '' : (input.iconURL ?? undefined),
          logoSourceType:
            typeof input.iconURL === 'string'
              ? input.iconURL
                ? 'ExternalLink'
                : 'GroupLogo'
              : undefined,
          group: input.unlinkGroup
            ? { disconnect: true }
            : input.group
              ? { connect: { uid: input.group } }
              : undefined,
          studentAssociation: input.unlinkStudentAssociation
            ? { disconnect: true }
            : input.studentAssociation
              ? { connect: { uid: input.studentAssociation } }
              : undefined,
          school: input.unlinkSchool
            ? { disconnect: true }
            : input.school
              ? { connect: { uid: input.school } }
              : undefined,
        },
      });
    },
  }),
);
