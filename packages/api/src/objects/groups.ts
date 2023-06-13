import { GroupType as GroupPrismaType } from '@prisma/client';
import { getDescendants, hasCycle, mappedGetAncestors } from 'arborist';
import dichotomid from 'dichotomid';
import slug from 'slug';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { LinkInput } from './links.js';
import { GraphQLError } from 'graphql';
import { unlink, writeFile } from 'node:fs/promises';
import { FileScalar } from './scalars.js';
import imageType, { minimumBytes } from 'image-type';

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
    pictureFile: t.exposeString('pictureFile'),
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
    selfJoinable: t.exposeBoolean('selfJoinable'),
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
    resolve: ({ id, familyId }) => ({ id, familyId: familyId ?? id }),
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

builder.queryField('searchGroups', (t) =>
  t.prismaField({
    type: [GroupType],
    args: { q: t.arg.string() },
    authScopes: { loggedIn: true },
    async resolve(query, _, { q }) {
      const terms = new Set(String(q).split(' ').filter(Boolean));
      const search = [...terms].join('&');
      return prisma.group.findMany({
        ...query,
        where: {
          OR: [
            { uid: { search } },
            { name: { search } },
            { description: { search } },
            { email: { search } },
          ],
        },
      });
    },
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
      selfJoinable: t.arg.boolean({ required: false }),
    },
    authScopes: (_, {}, { user }) => Boolean(user?.canEditGroups),
    async resolve(query, _, { type, name, schoolId, parentUid, selfJoinable }) {
      const parent = parentUid
        ? await prisma.group.findUniqueOrThrow({ where: { uid: parentUid } })
        : undefined;
      if (
        parent &&
        hasCycle([{ parentId: parent.id, id: -1 }, ...(await prisma.group.findMany({}))])
      )
        throw new GraphQLError('Le choix de ce groupe parent créerait un cycle.');

      let group = await prisma.group.create({
        ...query,
        data: {
          type,
          name,
          uid: await createGroupUid(name),
          school: { connect: { id: schoolId } },
          parent: parent ? { connect: { id: parent.id } } : undefined,
          familyRoot: parent ? { connect: { id: parent.familyId ?? parent.id } } : undefined,
          color: '#' + Math.random().toString(16).slice(2, 8).padEnd(6, '0'),
          linkCollection: { create: {} },
          selfJoinable: selfJoinable ?? false,
        },
      });

      if (!parent) {
        group = await prisma.group.update({
          ...query,
          where: { id: group.id },
          data: {
            familyId: group.id,
          },
        });
      }

      return group;
    },
  })
);

/** Updates a group. */
builder.mutationField('updateGroup', (t) =>
  t.prismaField({
    type: GroupType,
    errors: {},
    args: {
      uid: t.arg.string(),
      // type: t.arg({ type: GroupEnumType }),
      type: t.arg.string({
        validate: { regex: new RegExp('^' + Object.values(GroupPrismaType).join('|') + '$') },
      }),
      parentId: t.arg.id({ required: false }),
      name: t.arg.string({ validate: { maxLength: 255 } }),
      color: t.arg.string({ validate: { regex: /#[\dA-Fa-f]{6}/ } }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
      description: t.arg.string({ validate: { maxLength: 255 } }),
      email: t.arg.string({ validate: { email: true } }),
      longDescription: t.arg.string(),
      links: t.arg({ type: [LinkInput] }),
      selfJoinable: t.arg.boolean(),
    },
    authScopes: (_, { uid }, { user }) =>
      user?.canEditGroups ||
      (user?.groups ?? []).some(
        ({ president, secretary, treasurer, vicePresident, group }) =>
          group.uid === uid && (president || secretary || treasurer || vicePresident)
      ),
    async resolve(
      query,
      _,
      {
        uid,
        selfJoinable,
        type,
        parentId,
        name,
        color,
        address,
        description,
        email,
        longDescription,
        links,
      }
    ) {
      // We have 3 possible cases for updating the parent: either it is:
      // - null: the group does not have a parent anymore;
      //   In that case, the root (set by familyId) is the group itself.
      //   We don't need to change the root's children
      // - undefined: the group's parent is not changed;
      //   In that case, the root is unchanged too.
      // - a number: the group's parent is changed to the group with that ID.
      //   In that case, the root is changed to the root of the new parent.
      //
      let familyId;
      const oldGroup = await prisma.group.findUnique({ where: { uid } });
      if (oldGroup?.id === undefined)
        throw new GraphQLError("Impossible de trouver l'ID du groupe");
      if (parentId !== undefined) {
        if (parentId === null) {
          // First case (null): the group does not have a parent anymore.
          // Set both the parent and the root to the group itself.
          // eslint-disable-next-line unicorn/no-null
          parentId = null;
          familyId = oldGroup.id;
        } else {
          // Third case (number): the group's parent is changed to the group with that ID.
          const newParent = await prisma.group.findUnique({ where: { id: parentId } });
          if (!newParent) throw new GraphQLError('ID de groupe parent invalide');
          familyId = newParent.familyId ?? newParent.id;
          // Update all descendants' familyId to the new parent's familyId
          const allGroups = await prisma.group.findMany({});
          if (
            hasCycle(allGroups.map((g) => (g.id === oldGroup.id ? { ...oldGroup, parentId } : g)))
          )
            throw new GraphQLError('La modification créerait un cycle dans les groupes');

          const descendants = getDescendants(allGroups, oldGroup.id);
          console.log({ [`setting familyId to ${familyId} for`]: descendants.map((g) => g.name) });
          await prisma.group.updateMany({
            where: { id: { in: descendants.map((g) => g.id) } },
            data: {
              familyId,
            },
          });
        }
      }

      if (parentId === oldGroup.id)
        throw new GraphQLError('Le groupe ne peut pas être son propre parent');

      console.log({ parentId, familyId });
      return prisma.group.update({
        ...query,
        where: { uid },
        data: {
          type: type as GroupPrismaType,
          selfJoinable,
          name,
          color,
          parent:
            parentId === undefined
              ? undefined
              : parentId === null
              ? { disconnect: true }
              : { connect: { id: parentId } },
          familyRoot: familyId ? { connect: { id: familyId } } : undefined,
          address,
          description,
          email,
          longDescription,
          linkCollection: {
            update: {
              links: {
                deleteMany: {},
                createMany: { data: links },
              },
            },
          },
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

/** Update the club's picture */
builder.mutationField('updateGroupPicture', (t) =>
  t.field({
    type: 'String',
    args: {
      uid: t.arg.string(),
      file: t.arg({ type: FileScalar }),
    },
    authScopes: (_, { uid }, { user }) =>
      Boolean(user?.canEditGroups || user?.groups.some(({ group }) => group.uid === uid)),
    async resolve(_, { uid, file }) {
      console.log('updating group picture');
      const type = await file
        .slice(0, minimumBytes)
        .arrayBuffer()
        .then((array) => Buffer.from(array))
        .then(async (buffer) => imageType(buffer));
      if (!type || (type.ext !== 'png' && type.ext !== 'jpg'))
        throw new GraphQLError('File format not supported');
      console.log(`file type: ${type.ext}`);

      // Delete the existing picture
      const { pictureFile } = await prisma.group.findUniqueOrThrow({
        where: { uid },
        select: { pictureFile: true },
      });

      console.log(`existing picture: ${pictureFile}`);

      if (pictureFile) await unlink(new URL(pictureFile, process.env.STORAGE));

      const path = `${uid}.${type.ext}`;
      await writeFile(new URL(path, process.env.STORAGE), file.stream());
      await prisma.group.update({ where: { uid }, data: { pictureFile: path } });
      return path;
    },
  })
);

/** Delete the club's picture */
builder.mutationField('deleteGroupPicture', (t) =>
  t.field({
    type: 'Boolean',
    args: { uid: t.arg.string() },
    authScopes: (_, { uid }, { user }) => Boolean(user?.canEditGroups || uid === user?.uid),
    async resolve(_, { uid }) {
      const { pictureFile } = await prisma.user.findUniqueOrThrow({
        where: { uid },
        select: { pictureFile: true },
      });

      if (pictureFile) await unlink(new URL(pictureFile, process.env.STORAGE));

      await prisma.user.update({
        where: { uid },
        data: { pictureFile: '' },
      });
      return true;
    },
  })
);
