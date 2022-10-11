import { GroupType as GroupPrismaType } from '@prisma/client';
import slug from 'slug';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';

export const GroupEnumType = builder.enumType(GroupPrismaType, {
  name: 'GroupType',
});

/** Represents a group, mapped on the underlying database object. */
export const GroupType = builder.prismaNode('Group', {
  id: { field: 'id' },
  fields: (t) => ({
    // Because `id` is a Relay id, expose `groupId` as the real db id
    groupId: t.exposeID('id'),
    slug: t.exposeString('slug'),
    parentId: t.exposeID('parentId', { nullable: true }),
    familyId: t.exposeID('familyId', { nullable: true }),
    name: t.exposeString('name'),
    color: t.exposeString('color'),
    address: t.exposeString('address'),
    description: t.exposeString('description'),
    email: t.exposeString('email'),
    longDescription: t.exposeString('longDescription'),
    articles: t.relation('articles', {
      query: { orderBy: { publishedAt: 'desc' } },
    }),
    linkCollection: t.relation('linkCollection'),
    members: t.relation('members', {
      // Seeing group members requires being logged in
      authScopes: { loggedIn: true },
      query: {
        orderBy: [
          { president: 'desc' },
          { treasurer: 'desc' },
          { member: { firstName: 'asc' } },
          { member: { lastName: 'asc' } },
        ],
      },
    }),
    school: t.relation('school'),
  }),
});

/** List groups. */
builder.queryField('groups', (t) =>
  t.prismaField({
    type: [GroupType],
    args: {
      types: t.arg({ type: [GroupEnumType], required: false }),
    },
    resolve: (query, _, { types }) =>
      prisma.group.findMany({
        ...query,
        where: types ? { type: { in: types } } : {},
        orderBy: { name: 'asc' },
      }),
  })
);

/** Get a specific group. */
builder.queryField('group', (t) =>
  t.prismaField({
    type: GroupType,
    args: { slug: t.arg.string() },
    resolve: (query, _, { slug }) =>
      prisma.group.findUniqueOrThrow({
        ...query,
        where: { slug },
      }),
  })
);

/** Creates a new group. */
builder.mutationField('createGroup', (t) =>
  t.prismaField({
    type: GroupType,
    args: {
      type: t.arg({ type: GroupEnumType }),
      name: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      schoolId: t.arg.id(),
    },
    authScopes: (_, {}, { user }) => Boolean(user?.canEditGroups),
    resolve: async (query, _, { type, name, schoolId }) =>
      prisma.group.create({
        ...query,
        data: {
          type,
          name,
          school: { connect: { id: schoolId } },
          color: '#bbdfff',
          slug: slug(name),
          linkCollection: { create: {} },
        },
      }),
  })
);

/** Updates a group. */
builder.mutationField('updateGroup', (t) =>
  t.prismaField({
    type: GroupType,
    args: { id: t.arg.id(), name: t.arg.string() },
    authScopes: (_, { id }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ groupId, president }) => president && groupId === id)
      ),
    resolve: async (query, _, { id, name }) =>
      prisma.group.update({
        ...query,
        where: { id },
        data: { name },
      }),
  })
);

/** Deletes a group. */
builder.mutationField('deleteGroup', (t) =>
  t.field({
    type: 'Boolean',
    args: { id: t.arg.id() },
    authScopes: (_, { id }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ groupId, president }) => president && groupId === id)
      ),
    async resolve(_, { id }) {
      await prisma.group.delete({ where: { id } });
      return true;
    },
  })
);
