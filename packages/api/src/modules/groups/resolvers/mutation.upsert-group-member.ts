import { builder, ensureGlobalId, log, prisma, purgeSessionsUser, sendMail } from '#lib';
import { updateMemberBoardLists } from '#modules/mails';
import { fullName } from '#modules/users';
import { onBoard } from '#permissions';
import { canEditGroupMembers, GroupMemberType } from '../index.js';

// TODO centralize the mailer object in #lib instead of creating it here

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
      isDeveloper: t.arg.boolean(),
    },
    async authScopes(_, { groupId }, { user }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { id: ensureGlobalId(groupId, 'Group') },
        include: canEditGroupMembers.prismaIncludes,
      });
      return canEditGroupMembers(user, group);
    },
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
        isDeveloper,
      },
      { user: me },
    ) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { id: groupId },
        include: {
          studentAssociation: true,
        },
      });
      const { uid } = await prisma.user.findUniqueOrThrow({
        where: { id: memberId },
        select: { uid: true },
      });
      purgeSessionsUser(uid);
      const oldMember = await prisma.groupMember.findUnique({
        where: { groupId_memberId: { groupId, memberId } },
      });

      if (president) {
        await prisma.groupMember.updateMany({
          where: { group: { id: groupId }, president: true },
          data: {
            president: false,
            canEditMembers: false,
            canEditArticles: false,
            canScanEvents: false,
          },
        });
        await log(
          'group-member',
          'update',
          { message: `${uid} a été nommé·e président·e de ${groupId}` },
          groupId,
          me,
        );
      }

      const quittingBoard =
        onBoard(oldMember) && !onBoard({ president, treasurer, vicePresident, secretary });

      const data = {
        title,
        president,
        treasurer,
        groupId,
        memberId,
        canEditMembers: quittingBoard ? false : canEditMembers || president || treasurer,
        canEditArticles: quittingBoard
          ? false
          : canEditArticles || onBoard({ president, treasurer, vicePresident, secretary }),
        canScanEvents: quittingBoard
          ? false
          : canScanEvents || onBoard({ president, treasurer, vicePresident, secretary }),
        vicePresident,
        secretary,
        isDeveloper,
      };

      const groupMember = await prisma.groupMember.upsert({
        ...query,
        where: { groupId_memberId: { groupId, memberId } },
        create: data,
        update: data,
        include: { member: true },
      });

      try {
        await updateMemberBoardLists(memberId, groupId, group.type);
      } catch (error) {
        await log('mailing-lists', 'update-member/error', { error }, groupId, me);
      }

      await log(
        'group-member',
        'update',
        { message: `${uid} a été mis·e à jour dans ${groupId}` },
        groupId,
        me,
      );

      const boardKeys = ['president', 'vicePresident', 'treasurer', 'secretary'] as const;

      const rolesText = (member: Record<(typeof boardKeys)[number], boolean>) =>
        (boardKeys.some((k) => member[k]) ? boardKeys.filter((k) => member[k]) : ['(aucun)']).join(
          ', ',
        );

      if (
        oldMember &&
        boardKeys.some((k) => groupMember[k] !== oldMember[k]) &&
        group.type === 'Club'
      ) {
        // TODO store in DB
        const resposClubMail = `respos-clubs@${group.studentAssociation?.internalMailDomain}`;

        await sendMail(
          'group-board-updated',
          resposClubMail,
          {
            groupName: group.name,
            memberFullName: fullName(groupMember.member),
            rolesText: rolesText(groupMember),
          },
          {},
        );
      }

      return groupMember;
    },
  }),
);
