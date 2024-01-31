import { builder, prisma } from '#lib';

import { GraphQLError } from 'graphql';
import { LogoSourceTypeEnum, ServiceType } from '../index.js';

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
