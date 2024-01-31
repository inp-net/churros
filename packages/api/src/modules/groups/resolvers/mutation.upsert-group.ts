import { builder, log, prisma, purgeUserSessions } from '#lib';
import { LinkInput } from '#modules/links';
import { onBoard } from '#permissions';
import * as PrismaTypes from '@prisma/client';
import { getDescendants, hasCycle } from 'arborist';
import { GraphQLError } from 'graphql';
import {
  GroupEnumType,
  GroupType,
  createGroupUid,
  membersNeedToPayForTheStudentAssociation,
} from '../index.js';

/** Upserts a group. */
builder.mutationField('upsertGroup', (t) =>
  t.prismaField({
    type: GroupType,
    errors: {},
    args: {
      uid: t.arg.string({ required: false }),
      type: t.arg({ type: GroupEnumType }),
      parentUid: t.arg.string({ required: false }),
      schoolUid: t.arg.string({ required: false }),
      studentAssociationUid: t.arg.string({ required: false }),
      name: t.arg.string({ validate: { maxLength: 255 } }),
      color: t.arg.string({ validate: { regex: /#[\dA-Fa-f]{6}/ } }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
      description: t.arg.string({ validate: { maxLength: 255 } }),
      website: t.arg.string({ validate: { maxLength: 255 } }),
      email: t.arg.string({ validate: { email: true }, required: false }),
      longDescription: t.arg.string(),
      links: t.arg({ type: [LinkInput] }),
      selfJoinable: t.arg.boolean(),
      related: t.arg({ type: ['String'] }),
    },
    async authScopes(_, { uid, parentUid, type }, { user }) {
      if (!user) return false;
      const creating = !uid;
      const parentGroup = await prisma.group.findUnique({
        where: { uid: parentUid ?? '' },
        include: { members: true },
      });
      // allow board of parent group to create subgroups
      if (creating) {
        return Boolean(
          user?.canEditGroups ||
            (type === PrismaTypes.GroupType.Group &&
              parentGroup?.members.some(
                ({ memberId, ...permissions }) => memberId === user?.id && onBoard(permissions),
              )),
        );
      }

      return Boolean(
        user?.canEditGroups ||
          (user?.groups ?? []).some(
            ({ group, ...permissions }) => group.uid === uid && onBoard(permissions),
          ),
      );
    },
    // eslint-disable-next-line complexity
    async resolve(
      query,
      _,
      {
        uid,
        selfJoinable,
        type,
        parentUid,
        name,
        color,
        address,
        description,
        website,
        studentAssociationUid,
        email,
        longDescription,
        links,
        related,
      },
      { user },
    ) {
      if (!user) throw new GraphQLError("Vous n'êtes pas connecté·e");
      if (membersNeedToPayForTheStudentAssociation({ type }) && !studentAssociationUid)
        throw new GraphQLError("Il faut préciser l'AE de rattachement pour un club ou une liste");

      // --- First, we update the group's children's familyId according to the new parent of this group. ---
      // We have 2 possible cases for updating the parent: either it is:
      // - null (or set to ''): the group does not have a parent anymore;
      //   In that case, the root (set by familyId) is the group itself.
      //   We don't need to change the root's children
      // - an id: the group's parent is changed to the group with that ID.
      //   In that case, the root is changed to the root of the new parent.
      //   - if we are creating the group, we don't need to change its children since it has none
      //
      let familyId;
      const oldGroup = await prisma.group.findUnique({ where: { uid: uid ?? '' } });
      if (parentUid === null || parentUid === undefined || parentUid === '') {
        // First case (null): the group does not have a parent anymore.
        // Set both the parent and the root to the group itself.
        // eslint-disable-next-line unicorn/no-null
        parentUid = null;
        // eslint-disable-next-line unicorn/no-null
        familyId = oldGroup?.id ?? null;
      } else {
        // Third case (number): the group's parent is changed to the group with that ID.
        const newParent = await prisma.group.findUnique({ where: { uid: parentUid } });
        if (!newParent) throw new GraphQLError('uid de groupe parent invalide');
        familyId = newParent.familyId ?? newParent.id;
        // Update all descendants' familyId to the new parent's familyId
        // Or when creating (i.e. oldGroup is undefined), just check for cycles
        const allGroups = await prisma.group.findMany({});
        if (oldGroup) {
          if (
            hasCycle(
              allGroups.map((g) =>
                g.id === oldGroup.id ? { ...oldGroup, parentId: newParent.id } : g,
              ),
            )
          )
            throw new GraphQLError('La modification créerait un cycle dans les groupes');

          const descendants = getDescendants(allGroups, oldGroup.id);
          await prisma.group.updateMany({
            where: { id: { in: descendants.map((g) => g.id) } },
            data: {
              familyId,
            },
          });
        } else if (newParent.id && hasCycle([{ parentId: newParent.id, id: '' }, ...allGroups])) {
          throw new GraphQLError("Can't create a cycle");
        }
      }

      if (parentUid === oldGroup?.uid) throw new GraphQLError('Group cannot be its own parent');

      const data = {
        type,
        selfJoinable,
        name,
        color,
        familyRoot: familyId ? { connect: { id: familyId } } : undefined,
        address,
        description,
        website,
        email: email ?? undefined,
        longDescription,
      };

      const group = await prisma.group.upsert({
        ...query,
        where: { uid: uid ?? '' },
        create: {
          ...data,
          links: { create: links },
          uid: await createGroupUid(name),
          related: { connect: related.map((uid) => ({ uid })) },
          parent:
            parentUid === null || parentUid === undefined ? {} : { connect: { uid: parentUid } },
          studentAssociation: studentAssociationUid
            ? { connect: { uid: studentAssociationUid } }
            : {},
        },
        update: {
          ...data,
          links: {
            deleteMany: {},
            createMany: { data: links },
          },
          related: {
            set: related.map((uid) => ({ uid })),
          },
          parent:
            parentUid === null || parentUid === undefined
              ? { disconnect: true }
              : { connect: { uid: parentUid } },
          studentAssociation: studentAssociationUid
            ? { connect: { uid: studentAssociationUid } }
            : { disconnect: true },
        },
      });
      if ((await prisma.groupMember.count({ where: { groupId: group.id } })) === 0) {
        await prisma.group.update({
          where: { id: group.id },
          data: {
            members: {
              create: {
                president: true,
                title: 'Prez',
                member: {
                  connect: {
                    uid: user.uid,
                  },
                },
              },
            },
          },
        });
        purgeUserSessions(user.uid);
      }

      await log('groups', uid ? 'update' : 'create', group, group.uid, user);
      return group;
    },
  }),
);
