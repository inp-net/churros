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
    vicePresident: t.exposeBoolean('vicePresident'),
    secretary: t.exposeBoolean('secretary'),
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
    errors: {},
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

/** Adds a member to a group that is self-joinable. Does not require the same auth scopes. */
builder.mutationField('selfJoinGroup', (t) =>
  t.prismaField({
    type: GroupMemberType,
    args: {
      groupUid: t.arg.string(),
      uid: t.arg.string(),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { groupUid, uid }) {
      const group = await prisma.group.findUnique({ where: { uid: groupUid } });
      if (!group?.selfJoinable) throw new Error('This group is not self-joinable.');
      return prisma.groupMember.create({
        ...query,
        data: {
          member: { connect: { uid } },
          group: { connect: { uid: groupUid } },
          title: 'Membre', // don't allow people to name themselves "Président", for example.
        },
      });
    },
  })
);

/** Updates a group member. */
builder.mutationField('upsertGroupMember', (t) =>
  t.prismaField({
    type: GroupMemberType,
    args: {
      memberId: t.arg.id(),
      groupId: t.arg.id(),
      title: t.arg.string(),
      president: t.arg.boolean(),
      treasurer: t.arg.boolean(),
      vicePresident: t.arg.boolean(),
      secretary: t.arg.boolean(),
      canEditMembers: t.arg.boolean(),
      canEditArticles: t.arg.boolean(),
    },
    authScopes: (_, { groupId }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ group, canEditMembers }) => canEditMembers && group.id === groupId)
      ),
    async resolve(
      query,
      _,
      {
        memberId,
        groupId,
        title,
        president,
        treasurer,
        secretary,
        vicePresident,
        canEditArticles,
        canEditMembers,
      }
    ) {
      if (president) {
        await prisma.groupMember.updateMany({
          where: { group: { id: groupId }, president: true },
          data: { president: false },
        });
      }

      const data = {
        title,
        president,
        treasurer,
        groupId,
        memberId,
        canEditMembers: canEditMembers || president || treasurer,
        canEditArticles: canEditArticles || president || vicePresident || secretary,
        vicePresident,
      };

      return prisma.groupMember.upsert({
        ...query,
        where: { groupId_memberId: { groupId, memberId } },
        create: data,
        update: data,
      });
    },
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
