import { builder, prisma } from '#lib';
import { GroupTypePrismaIncludes } from '#modules/groups';
import { StudentAssociationPrismaIncludes } from '#modules/student-associations';
import { GraphQLError } from 'graphql';
import { LogoSourceTypeEnum, serviceIsPinnedByUser, ServiceOwnerType } from '../index.js';
import { canEditService } from '../utils/permissions.js';

export const ServiceTypePrismaIncludes = {
  group: {
    include: GroupTypePrismaIncludes,
  },
  studentAssociation: {
    include: StudentAssociationPrismaIncludes,
  },
  school: true,
};
export const ServiceType = builder.prismaNode('Service', {
  id: { field: 'id' },
  include: ServiceTypePrismaIncludes,
  fields: (t) => ({
    name: t.exposeString('name'),
    url: t.exposeString('url'),
    description: t.exposeString('description'),
    logo: t.exposeString('logo'),
    logoSourceType: t.expose('logoSourceType', {
      type: LogoSourceTypeEnum,
    }),
    group: t.relation('group', { nullable: true, deprecationReason: 'Use `owner` instead' }),
    school: t.relation('school', { nullable: true, deprecationReason: 'Use `owner` instead' }),
    studentAssociation: t.relation('studentAssociation', {
      nullable: true,
      deprecationReason: 'Use `owner` instead',
    }),
    pinned: t.boolean({
      description:
        "Le service a été épinglé par l'utilisateur·ice connecté·e. Pour gérer cela, créer ou enlever un `Bookmark` avec pour `path` l'`id` (avec préfixe) du service.",
      async resolve(service, _, { user }) {
        return serviceIsPinnedByUser(service, user);
      },
    }),
    owner: t.field({
      type: ServiceOwnerType,
      resolve: ({ group, studentAssociation, school, name, id }) => {
        if (group) return group;
        if (studentAssociation) return studentAssociation;
        if (school) return school;
        throw new GraphQLError(`Le service ${name} ne possède pas de responsable (${id})`);
      },
    }),
    importance: t.exposeInt('importance'),
    hidden: t.exposeBoolean('hidden', {
      description: "Le service n'est pas affiché sur le site",
    }),
    canEdit: t.boolean({
      description: 'L’utilisateur·ice peut modifier le service',
      async resolve({ id }, _, { user }) {
        const service = await prisma.service.findUniqueOrThrow({
          where: { id },
          include: canEditService.prismaIncludes,
        });
        return canEditService(user, service);
      },
    }),
  }),
});
