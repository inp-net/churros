import { builder, prisma, purgeUserSessions } from '#lib';

import { onBoard } from '#permissions';
import { createTransport } from 'nodemailer';
import { GroupMemberType } from '../index.js';

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
    },
    authScopes: (_, { groupId }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ group, canEditMembers }) => canEditMembers && group.id === groupId),
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
      { user: me },
    ) {
      const group = await prisma.group.findUniqueOrThrow({ where: { id: groupId } });
      const { uid } = await prisma.user.findUniqueOrThrow({
        where: { id: memberId },
        select: { uid: true },
      });
      purgeUserSessions(uid);
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
      };

      const groupMember = await prisma.groupMember.upsert({
        ...query,
        where: { groupId_memberId: { groupId, memberId } },
        create: data,
        update: data,
        include: { member: true },
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
        // TODO send notification too
        const mailer = createTransport(process.env.SMTP_URL);
        await mailer.sendMail({
          from: process.env.PUBLIC_CONTACT_EMAIL,
          to: 'respos-clubs@bde.enseeiht.fr',
          subject: `Bureau de ${group.name} modifié`,
          text: `${groupMember.member.firstName} ${groupMember.member.lastName} (@${
            groupMember.member.uid
          }) a maintenant les rôles ${rolesText(groupMember)} (avant: ${rolesText(oldMember)})`,
          html: `<a href="${process.env.FRONTEND_ORIGIN}/@${groupMember.member.uid}">${
            groupMember.member.firstName
          } ${groupMember.member.lastName} (@${
            groupMember.member.uid
          })</a> a maintenant les rôles ${rolesText(groupMember)} (avant: ${rolesText(oldMember)})`,
        });
      }

      return groupMember;
    },
  }),
);
