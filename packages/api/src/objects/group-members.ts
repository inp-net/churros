import { builder, prisma } from '#lib';
import { GroupType } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { GraphQLError } from 'graphql';
import { createTransport } from 'nodemailer';
import { onBoard } from '../auth.js';
import { purgeUserSessions } from '../context.js';
import {
  addMemberToGroupMailingList,
  removeMemberFromGroupMailingList,
  updateMemberBureauLists,
} from './mailing-lists.js';
import { DateTimeScalar } from './scalars.js';
import { fullName } from './users.js';

const mailer = createTransport(process.env.SMTP_URL);

export const GroupMemberType = builder.prismaObject('GroupMember', {
  fields: (t) => ({
    memberId: t.exposeID('memberId'),
    groupId: t.exposeID('groupId'),
    title: t.string({ resolve: ({ title }) => title || 'Membre' }),
    president: t.exposeBoolean('president'),
    treasurer: t.exposeBoolean('treasurer'),
    vicePresident: t.exposeBoolean('vicePresident'),
    secretary: t.exposeBoolean('secretary'),
    canEditMembers: t.boolean({
      resolve({ canEditMembers, ...roles }) {
        return onBoard(roles) || canEditMembers;
      },
    }),
    canEditArticles: t.boolean({
      resolve({ canEditArticles, ...roles }) {
        return onBoard(roles) || canEditArticles;
      },
    }),
    canScanEvents: t.boolean({
      resolve({ canScanEvents, ...roles }) {
        return onBoard(roles) || canScanEvents;
      },
    }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    member: t.relation('member'),
    group: t.relation('group'),
  }),
});

export function membersNeedToPayForTheStudentAssociation(group: { type: GroupType }): boolean {
  return group.type === GroupType.Club || group.type === GroupType.List;
}

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
          contributions: {
            include: { option: { include: { paysFor: { include: { school: true } } } } },
          },
        },
      });
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
        include: { studentAssociation: true },
      });

      if (
        membersNeedToPayForTheStudentAssociation(group) &&
        !member.contributions.some(({ option: { paysFor } }) =>
          paysFor.some(({ id }) => id === group.studentAssociation?.id),
        )
      ) {
        // pas cotisant
        throw new GraphQLError(`${fullName(member)} n'est pas cotisant·e`);
      }

      return Boolean(
        user?.canEditGroups ||
          user?.groups.some(
            ({ group, canEditMembers }) => canEditMembers && group.uid === groupUid,
          ),
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
        const { email } = await prisma.user.findUniqueOrThrow({
          where: { uid },
          select: { email: true },
        });
        await addMemberToGroupMailingList(groupUid, email);

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

      const { email } = await prisma.user.findUniqueOrThrow({
        where: { uid },
        select: { email: true },
      });
      await addMemberToGroupMailingList(groupUid, email);

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

      if (
        group.type === 'Club' ||
        group.type === 'Association' ||
        group.type === 'StudentAssociationSection'
      )
        await updateMemberBureauLists(memberId);

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

/** Removes a member from a group. */
builder.mutationField('deleteGroupMember', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      memberId: t.arg.id(),
      groupId: t.arg.id(),
    },
    authScopes: (_, { memberId, groupId }, { user }) =>
      Boolean(
        memberId === user?.id ||
          user?.canEditGroups ||
          user?.groups.some(({ groupId: id, canEditMembers }) => canEditMembers && groupId === id),
      ),
    async resolve(_, { memberId, groupId }, { user: me }) {
      const { type } = await prisma.group.findUniqueOrThrow({
        where: { id: groupId },
        select: { type: true },
      });

      const { uid, email } = await prisma.user.findUniqueOrThrow({
        where: { id: memberId },
        select: { uid: true, email: true },
      });

      if (type === 'Club' || type === 'Association') {
        await removeMemberFromGroupMailingList(groupId, email);
        await updateMemberBureauLists(memberId);
      }

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
  }),
);

builder.queryField('groupMembersCsv', (t) =>
  t.field({
    type: 'String',
    errors: {},
    args: {
      groupUid: t.arg.string(),
    },
    authScopes: (_, { groupUid }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(
            ({ group, canEditMembers }) => canEditMembers && group.uid === groupUid,
          ),
      ),
    async resolve(_query, { groupUid }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
        include: { studentAssociation: true },
      });
      const members = await prisma.groupMember.findMany({
        where: { group: { uid: groupUid } },
        include: {
          member: {
            include: {
              major: true,
              contributions: { include: { option: { include: { paysFor: true } } } },
            },
          },
        },
      });
      const humanBoolean = (b: boolean) => (b ? 'Oui' : 'Non');
      const columns = [
        'Date',
        'Prénom',
        'Nom',
        'Email',
        'Cotisant',
        'Filière',
        'Apprenti',
        'Promo',
      ] as const;

      const mapping = ({
        createdAt,
        member: { firstName, lastName, email, contributions, major, apprentice, graduationYear },
      }: (typeof members)[number]) =>
        ({
          Date: createdAt.toISOString(),
          Prénom: firstName,
          Nom: lastName,
          Email: email,
          Cotisant: humanBoolean(
            contributions.some(({ option: { paysFor } }) =>
              paysFor.some((ae) => ae.uid === group.studentAssociation?.uid),
            ),
          ),
          Filière: major?.shortName ?? '',
          Apprenti: humanBoolean(apprentice),
          Promo: graduationYear.toString(),
        }) satisfies Record<(typeof columns)[number], string>;

      let result = columns.join(',') + '\n';

      result += members
        .map((element) => mapping(element))
        .map((row) => columns.map((c) => row[c]).join(','))
        .join('\n');

      return result;
    },
  }),
);
