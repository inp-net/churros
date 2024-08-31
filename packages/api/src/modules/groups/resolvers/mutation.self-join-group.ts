import { builder, log, prisma, purgeSessionsUser, UnauthorizedError } from '#lib';
import { UIDScalar } from '#modules/global';
import { addMemberToGroupMailingList } from '#modules/mails';
import { GraphQLError } from 'graphql';
import { GroupMemberType, membersNeedToPayForTheStudentAssociation } from '../index.js';

/** Adds a member to a group that is self-joinable. Does not require the same auth scopes. */
builder.mutationField('selfJoinGroup', (t) =>
  t.prismaField({
    type: GroupMemberType,
    errors: {},
    args: { uid: t.arg({ type: UIDScalar }) },
    authScopes: { student: true },
    async resolve(query, _, { uid }, { user: me }) {
      if (!me) throw new UnauthorizedError();
      const group = await prisma.group.findUnique({
        where: { uid },
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

      purgeSessionsUser(uid);
      const groupMember = await prisma.groupMember.create({
        ...query,
        data: {
          member: { connect: { uid } },
          group: { connect: { uid: me.uid } },
          title: 'Membre', // don't allow people to name themselves "Président", for example.
        },
      });

      const { email } = await prisma.user.findUniqueOrThrow({
        where: { uid },
        select: { email: true },
      });
      await addMemberToGroupMailingList(uid, email);

      await log(
        'group-member',
        'create',
        { message: `${me.uid} a rejoins ${uid}` },
        groupMember.groupId,
        me,
      );
      return groupMember;
    },
  }),
);
