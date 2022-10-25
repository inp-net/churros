import { GroupType as GroupPrismaType } from '@prisma/client';
import { mappedGetAncestors } from 'arborist';
import dichotomid from 'dichotomid';
import slug from 'slug';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';

export const GroupEnumType = builder.enumType(GroupPrismaType, { name: 'GroupType' });

export const GroupType = builder.prismaNode('Group', {
  id: { field: 'id' },
  fields: (t) => ({
    // Because `id` is a Relay id, expose `groupId` as the real db id
    groupId: t.exposeID('id'),
    type: t.expose('type', { type: GroupEnumType }),
    uid: t.exposeString('uid'),
    parentId: t.exposeID('parentId', { nullable: true }),
    familyId: t.exposeID('familyId', { nullable: true }),
    name: t.exposeString('name'),
    color: t.exposeString('color'),
    address: t.exposeString('address'),
    description: t.exposeString('description'),
    email: t.exposeString('email'),
    longDescription: t.exposeString('longDescription'),
    longDescriptionHtml: t.string({
      resolve: async ({ longDescription }) => toHtml(longDescription),
    }),
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
    school: t.relation('school', { nullable: true }),
    parent: t.relation('parent'),
  }),
});

// Because it's too hard for Pothos to correctly type recursive data loading,
// we declare the field after the type
builder.objectField(GroupType, 'ancestors', (t) =>
  // Declare `Groups.ancestors` as a batch-loadable field, to avoid the N+1 problem
  t.loadableList({
    type: GroupType,
    description: 'All the ancestors of this group, from the current group to the root.',
    // Because this request can be expensive, only allow logged in users
    authScopes: { loggedIn: true },
    resolve: ({ id, familyId }) => ({ id, familyId }),
    load: async (ids) =>
      prisma.group
        // Get all groups in the same family as the current groups
        .findMany({ where: { familyId: { in: ids.map(({ familyId }) => familyId) } } })
        // Get the ancestors of each group
        .then((groups) => mappedGetAncestors(groups, ids)),
  })
);

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

builder.queryField('group', (t) =>
  t.prismaField({
    type: GroupType,
    args: { uid: t.arg.string() },
    resolve: (query, _, { uid }) => prisma.group.findUniqueOrThrow({ ...query, where: { uid } }),
  })
);

builder.queryField('searchGroup', (t) =>
  t.prismaConnection({
    type: GroupType,
    cursor: 'id',
    // authScopes: { loggedIn: true },
    args: { q: t.arg.string() },
    resolve: async (query, _, { q }) =>
      prisma.group.findMany({
        ...query,
        where: { name: { startsWith: q, mode: 'insensitive' } },
      }),
  })
);

const createGroupUid = async (name: string) => {
  const groupSlug = slug(name);
  const createUid = (i: number) => (i === 1 ? groupSlug : `${groupSlug}-${i}`);
  const i = await dichotomid(
    async (i) => !(await prisma.group.findFirst({ where: { uid: createUid(i) } }))
  );
  return createUid(i);
};

/** Creates a new group. */
builder.mutationField('createGroup', (t) =>
  t.prismaField({
    type: GroupType,
    args: {
      type: t.arg({ type: GroupEnumType }),
      name: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      schoolId: t.arg.id(),
      parentUid: t.arg.string({ required: false }),
    },
    authScopes: (_, {}, { user }) => Boolean(user?.canEditGroups),
    async resolve(query, _, { type, name, schoolId, parentUid }) {
      const parent = parentUid
        ? await prisma.group.findUniqueOrThrow({ where: { uid: parentUid } })
        : undefined;
      return prisma.group.create({
        ...query,
        data: {
          type,
          name,
          uid: await createGroupUid(name),
          school: { connect: { id: schoolId } },
          parent: parent ? { connect: { id: parent.id } } : undefined,
          familyRoot: parent ? { connect: { id: parent.familyId } } : undefined,
          color: '#' + Math.random().toString(16).slice(2, 8).padEnd(6, '0'),
          linkCollection: { create: {} },
        },
      });
    },
  })
);

/** Deletes a group. */
builder.mutationField('deleteGroup', (t) =>
  t.field({
    type: 'Boolean',
    args: { uid: t.arg.string() },
    authScopes: (_, { uid }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ group, president }) => president && group.uid === uid)
      ),
    async resolve(_, { uid }) {
      await prisma.group.delete({ where: { uid } });
      return true;
    },
  })
);
