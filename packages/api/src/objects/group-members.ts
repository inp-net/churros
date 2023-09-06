import { GraphQLError } from 'graphql';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar } from './scalars.js';
import { fullName } from './users.js';
import { purgeUserSessions } from '../context.js';
import { GroupType } from '@prisma/client';

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
    canScanEvents: t.exposeBoolean('canScanEvents'),
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
    async authScopes(_, { groupUid, uid }, { user }) {
      const member = await prisma.user.findUniqueOrThrow({
        where: { uid },
        include: {
          contributions: { include: { studentAssociation: { include: { school: true } } } },
        },
      });
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
        include: { school: true, studentAssociation: true },
      });

      if (
        (group.type === GroupType.Club || group.type === GroupType.List) &&
        !member.contributions.some(
          ({ studentAssociation: { school, id } }) =>
            school.uid === group.school?.uid || id === group.studentAssociation?.id
        )
      ) {
        // pas cotisant
        throw new GraphQLError(`${fullName(member)} n'est pas cotisant·e`);
      }

      return Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ group, canEditMembers }) => canEditMembers && group.uid === groupUid)
      );
    },
    async resolve(query, _, { groupUid, uid, title }, { user }) {
      purgeUserSessions(uid);
      const groupMember = await prisma.groupMember.create({
        ...query,
        data: {
          member: { connect: { uid } },
          group: { connect: { uid: groupUid } },
          title,
        },
      });
      await prisma.logEntry.create({
        data: {
          area: 'group-member',
          action: 'create',
          target: groupMember.groupId,
          message: `${uid} a été ajouté·e à ${groupUid}`,
          user: { connect: { id: user?.id } },
        },
      });
      return groupMember;
    },
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
    async resolve(query, _, { groupUid, uid }, { user: me }) {
      const group = await prisma.group.findUnique({ where: { uid: groupUid } });
      if (!group?.selfJoinable) throw new Error('This group is not self-joinable.');
      purgeUserSessions(uid);
      const groupMember = await prisma.groupMember.create({
        ...query,
        data: {
          member: { connect: { uid } },
          group: { connect: { uid: groupUid } },
          title: 'Membre', // don't allow people to name themselves "Président", for example.
        },
      });
      await prisma.logEntry.create({
        data: {
          area: 'group-member',
          action: 'create',
          target: groupMember.groupId,
          message: `${uid} a rejoins ${groupUid}`,
          user: me ? { connect: { uid: me.uid } } : undefined,
        },
      });
      return groupMember;
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
      canScanEvents: t.arg.boolean(),
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
        canScanEvents,
      },
      { user: me }
    ) {
      const { uid } = await prisma.user.findUniqueOrThrow({
        where: { id: memberId },
        select: { uid: true },
      });
      purgeUserSessions(uid);
      if (president) {
        await prisma.groupMember.updateMany({
          where: { group: { id: groupId }, president: true },
          data: { president: false },
        });
        await prisma.logEntry.create({
          data: {
            area: 'group-member',
            action: 'update',
            target: groupId,
            message: `${uid} a été nommé·e président·e de ${groupId}`,
            user: me ? { connect: { id: me.id } } : undefined,
          },
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
        canScanEvents: canScanEvents || president || vicePresident || secretary,
        vicePresident,
        secretary,
      };

      const groupMember = await prisma.groupMember.upsert({
        ...query,
        where: { groupId_memberId: { groupId, memberId } },
        create: data,
        update: data,
      });
      await prisma.logEntry.create({
        data: {
          area: 'group-member',
          action: 'update',
          target: groupId,
          message: `${uid} a été mis·e à jour dans ${groupId}`,
          user: me ? { connect: { id: me.id } } : undefined,
        },
      });
      return groupMember;
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
    async resolve(_, { memberId, groupId }, { user: me }) {
      const { uid } = await prisma.user.findUniqueOrThrow({
        where: { id: memberId },
        select: { uid: true },
      });
      purgeUserSessions(uid);
      await prisma.groupMember.delete({ where: { groupId_memberId: { groupId, memberId } } });
      await prisma.logEntry.create({
        data: {
          area: 'group-member',
          action: 'delete',
          target: groupId,
          message: `${uid} a été supprimé·e de ${groupId}`,
          user: me ? { connect: { id: me.id } } : undefined,
        },
      });
      return true;
    },
  })
);
