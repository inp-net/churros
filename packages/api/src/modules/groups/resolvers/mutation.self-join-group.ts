import { builder, prisma, purgeUserSessions } from '#lib';

import { GraphQLError } from 'graphql';
import { GroupMemberType, membersNeedToPayForTheStudentAssociation } from '../index.js';

/** Adds a member to a group that is self-joinable. Does not require the same auth scopes. */
builder.mutationField('selfJoinGroup', (t) =>
  t.prismaField({
    type: GroupMemberType,
    args: {
      groupUid: t.arg.string(),
      uid: t.arg.string(),
    },
    authScopes: { student: true },
    async resolve(query, _, { groupUid, uid }, { user: me }) {
      const group = await prisma.group.findUnique({
        where: { uid: groupUid },
        include: { studentAssociation: true },
      });
      if (!group?.selfJoinable) throw new Error('This group is not self-joinable.');
      if (
        membersNeedToPayForTheStudentAssociation(group) &&
        (await prisma.contribution.count({
          where: {
            userId: me?.id,
            option: { paysFor: { some: { id: group.studentAssociation?.id } } },
          },
        })) <= 0
      )
        throw new GraphQLError(`Tu n'es pas cotisant·e pour ${group.studentAssociation?.name}.`);

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
  }),
);
