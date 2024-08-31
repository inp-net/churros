import { builder } from '#lib';
import { GroupTypePrismaIncludes } from '#modules/groups';
import { StudentAssociationPrismaIncludes } from '#modules/student-associations';
import { GraphQLError } from 'graphql';
import { LogoSourceTypeEnum, ServiceOwnerType } from '../index.js';

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
  }),
});
