import { builder, ensureGlobalId, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { GraphQLError } from 'graphql';
import { ServiceType } from '../index.js';

builder.queryField('service', (t) =>
  t.prismaField({
    type: ServiceType,
    args: {
      id: t.arg({ type: LocalID }),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin);
    },
    async resolve(query, _, { id }) {
      const service = await prisma.service.findUnique({
        ...query,
        where: {
          id: ensureGlobalId(id, 'Service'),
        },
        include: {
          group: true,
          studentAssociation: true,
          school: true,
        },
      });
      if (!service) throw new GraphQLError('Service not found');
      return service;
    },
  }),
);
