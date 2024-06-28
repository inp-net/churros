import { builder, prisma, purgeUserSessions } from '#lib';

import { addMemberToGroupMailingList } from '#modules/mails';
import { fullName } from '#modules/users';
import { userIsAdminOf, userIsGroupEditorOf } from '#permissions';
import { PrismaClientKnownRequestError } from '@churros/db/prisma/runtime/library';
import { GraphQLError } from 'graphql';
import { GroupMemberType, membersNeedToPayForTheStudentAssociation } from '../index.js';

/** Adds a member to a group. */
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
          contributions: {
            include: { option: { include: { paysFor: { include: { school: true } } } } },
          },
        },
      });
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
      });

      if (
        membersNeedToPayForTheStudentAssociation(group) &&
        !member.contributions.some(({ option: { paysFor } }) =>
          paysFor.some(({ id }) => id === group?.studentAssociationId),
        )
      ) {
        // pas cotisant
        throw new GraphQLError(`${fullName(member)} n'est pas cotisant·e`);
      }

      return Boolean(
        userIsAdminOf(user, group?.studentAssociationId) ||
          userIsGroupEditorOf(user, group?.studentAssociationId) ||
          user?.groups.some(({ group }) => group.uid === groupUid),
      );
    },
    async resolve(query, _, { groupUid, uid, title }, { user }) {
      purgeUserSessions(uid);
      try {
        const groupMember = await prisma.groupMember.create({
          ...query,
          data: {
            member: { connect: { uid } },
            group: { connect: { uid: groupUid } },
            title,
          },
        });

        const { type } = await prisma.group.findUniqueOrThrow({
          where: { uid: groupUid },
          select: { type: true },
        });
        if (type === 'Club' || type === 'Association') {
          const { email } = await prisma.user.findUniqueOrThrow({
            where: { uid },
            select: { email: true },
          });
          await addMemberToGroupMailingList(groupUid, email);
        }

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
      } catch (error: unknown) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002')
          throw new GraphQLError(`@${uid} est déjà dans ${groupUid}`);

        throw error;
      }
    },
  }),
);
