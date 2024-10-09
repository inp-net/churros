import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { ServiceType } from '#modules/services/types';
import { canEditService } from '../utils/permissions.js';

builder.mutationField('deleteService', (t) =>
  t.prismaField({
    type: ServiceType,
    errors: {},
    description: 'Supprime un service',
    args: {
      id: t.arg({ type: LocalID, required: true }),
    },
    async authScopes(_, { id }, { user }) {
      const service = await prisma.service.findUniqueOrThrow({
        where: {
          id: ensureGlobalId(id, 'Service'),
        },
        include: canEditService.prismaIncludes,
      });
      return canEditService(user, service);
    },
    async resolve(query, _, { id }, { user }) {
      await log('services', 'delete', { id }, id, user);
      return prisma.service.delete({
        ...query,
        where: {
          id: ensureGlobalId(id, 'Service'),
        },
      });
    },
  }),
);
