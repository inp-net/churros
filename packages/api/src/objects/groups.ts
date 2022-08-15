import { GroupType as GroupPrismaType } from '@prisma/client';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';

export const GroupEnumType = builder.enumType(GroupPrismaType, {
  name: 'GroupType',
});

/** Represents a group, mapped on the underlying database object. */
export const GroupType = builder.prismaObject('Group', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    color: t.exposeString('color'),
    articles: t.relation('articles', {
      query: { orderBy: { publishedAt: 'desc' } },
    }),
    members: t.relation('members', {
      // Seeing group members requires being logged in
      authScopes: { loggedIn: true },
      query: {
        orderBy: [
          { president: 'desc' },
          { treasurer: 'desc' },
          { member: { firstname: 'asc' } },
          { member: { lastname: 'asc' } },
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
    args: { id: t.arg.id() },
    resolve: (query, _, { id }) =>
      prisma.group.findUniqueOrThrow({
        ...query,
        where: { id },
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
        data: { type, name, schoolId, color: '#bbdfff' },
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
