import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar } from './scalars.js';

/**
 * Represents a group member, mapped on the underlying database object.
 *
 * This is the intermediate object in the many to many relationship.
 */
export const GroupMemberType = builder.prismaObject('GroupMember', {
  fields: (t) => ({
    memberId: t.exposeID('memberId'),
    groupId: t.exposeID('groupId'),
    title: t.string({ resolve: ({ title }) => title || 'Membre' }),
    president: t.exposeBoolean('president'),
    treasurer: t.exposeBoolean('treasurer'),
    canEditMembers: t.exposeBoolean('canEditMembers'),
    canEditArticles: t.exposeBoolean('canEditArticles'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    member: t.relation('member'),
    group: t.relation('group'),
  }),
});

/** Adds a member to a group. The member is found by their name. */
builder.mutationField('addGroupMember', (t) =>
  t.prismaField({
    type: GroupMemberType,
    args: {
      groupId: t.arg.id(),
      uid: t.arg.string(),
      title: t.arg.string(),
    },
    authScopes: (_, { groupId }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ groupId: id, canEditMembers }) => canEditMembers && groupId === id)
      ),
    resolve: (query, _, { groupId, uid, title }) =>
      prisma.groupMember.create({
        ...query,
        data: {
          member: { connect: { uid } },
          group: { connect: { id: groupId } },
          title,
        },
      }),
  })
);

/** Updates a group member. */
builder.mutationField('updateGroupMember', (t) =>
  t.prismaField({
    type: GroupMemberType,
    args: {
      memberId: t.arg.id(),
      groupId: t.arg.id(),
      title: t.arg.string(),
    },
    authScopes: (_, { groupId }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ groupId: id, canEditMembers }) => canEditMembers && groupId === id)
      ),
    resolve: (query, _, { memberId, groupId, title }) =>
      prisma.groupMember.update({
        ...query,
        where: { groupId_memberId: { groupId, memberId } },
        data: { title },
      }),
  })
);

/** Removes a member from a group. */
builder.mutationField('deleteGroupMember', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      memberId: t.arg.id(),
      groupId: t.arg.id(),
    },
    authScopes: (_, { groupId }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ groupId: id, canEditMembers }) => canEditMembers && groupId === id)
      ),
    async resolve(_, { memberId, groupId }) {
      await prisma.groupMember.delete({ where: { groupId_memberId: { groupId, memberId } } });
      return true;
    },
  })
);
