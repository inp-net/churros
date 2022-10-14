import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar } from './scalars.js';

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
      groupUid: t.arg.string(),
      uid: t.arg.string(),
      title: t.arg.string(),
    },
    authScopes: (_, { groupUid }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ group, canEditMembers }) => canEditMembers && group.uid === groupUid)
      ),
    resolve: (query, _, { groupUid, uid, title }) =>
      prisma.groupMember.create({
        ...query,
        data: {
          member: { connect: { uid } },
          group: { connect: { uid: groupUid } },
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
