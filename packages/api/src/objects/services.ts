import { builder, prisma } from '#lib';
import { LogoSourceType } from '@prisma/client';
import { GraphQLError } from 'graphql';

export const LogoSourceTypeEnum = builder.enumType(LogoSourceType, { name: 'LogoSourceType' });

export const ServiceType = builder.prismaObject('Service', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    url: t.exposeString('url'),
    description: t.exposeString('description'),
    logo: t.exposeString('logo'),
    logoSourceType: t.expose('logoSourceType', {
      type: LogoSourceTypeEnum,
    }),
    group: t.relation('group', { nullable: true }),
    school: t.relation('school', { nullable: true }),
    studentAssociation: t.relation('studentAssociation', { nullable: true }),
    importance: t.exposeInt('importance'),
  }),
});

builder.queryField('service', (t) =>
  t.prismaField({
    type: ServiceType,
    args: {
      id: t.arg.id(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin);
    },
    async resolve(query, _, { id }) {
      const service = await prisma.service.findUnique({
        ...query,
        where: {
          id: id ?? undefined,
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

builder.mutationField('upsertService', (t) =>
  t.prismaField({
    type: ServiceType,
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
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
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin);
    },
    async resolve(
      query,
      _,
      {
        id,
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

      await prisma.logEntry.create({
        data: {
          area: 'service',
          action: 'create',
          target: service.id,
          message: `Service ${service.id} created: ${service.name}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });

      return service;
    },
  }),
);
