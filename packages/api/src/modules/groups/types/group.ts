import { builder, ensureGlobalId, fromYearTier, prisma, toHtml } from '#lib';
import { ColorScalar, DateTimeScalar, Email, HTMLScalar } from '#modules/global';
import { prismaQueryAccessibleArticles } from '#permissions';
import { GraphQLError } from 'graphql';
import { PicturedInterface } from '../../global/types/pictured.js';
import { canEditGroup, GroupEnumType, GroupMemberType } from '../index.js';
import {
  canChangeGroupStudentAssociation,
  canChangeGroupType,
  canChangeParentGroup,
  canEditGroupMembers,
  canEditLydiaAccounts,
  canSetGroupJoinPolicy,
  canSetGroupRoomOpenState,
  requiredPrismaIncludesForPermissions,
} from '../utils/index.js';
import { prismaOrderGroupMemberships } from '../utils/sort.js';

export const GroupTypePrismaIncludes = {
  ...requiredPrismaIncludesForPermissions,
  ...canEditGroup.prismaIncludes,
};

export const GroupType = builder.prismaNode('Group', {
  id: { field: 'id' },
  include: GroupTypePrismaIncludes,
  interfaces: [PicturedInterface],
  fields: (t) => ({
    // Because `id` is a Relay id, expose `groupId` as the real db id
    groupId: t.exposeID('id'),
    type: t.expose('type', { type: GroupEnumType }),
    unlisted: t.exposeBoolean('unlisted', {
      description: 'Le groupe doit être caché des listes de groupes',
    }),
    uid: t.exposeString('uid'),
    parentId: t.exposeID('parentId', { nullable: true }),
    familyId: t.exposeID('familyId', { nullable: true }),
    name: t.exposeString('name'),
    color: t.field({
      nullable: true,
      type: ColorScalar,
      resolve: (group) => group.color || null,
    }),
    address: t.exposeString('address'),
    description: t.exposeString('description', {
      deprecationReason: 'Use `shortDescription` instead',
    }),
    shortDescription: t.exposeString('description'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    email: t.field({ type: Email, nullable: true, resolve: ({ email }) => email || null }),
    mailingList: t.exposeString('mailingList'),
    longDescription: t.exposeString('longDescription'),
    longDescriptionHtml: t.field({
      type: HTMLScalar,
      resolve: async ({ longDescription }) => toHtml(longDescription),
    }),
    website: t.exposeString('website'),
    pictureFile: t.exposeString('pictureFile'),
    pictureFileDark: t.exposeString('pictureFileDark'),
    ldapUid: t.exposeString('ldapUid'),
    roomIsOpen: t.exposeBoolean('roomIsOpen'),
    canSetGroupRoomOpenState: t.boolean({
      description: "L'utilisater.ice connecté.e a le droit de mettre à jour roomIsOpen",
      resolve: (group, _, { user }) => canSetGroupRoomOpenState(user, group),
    }),
    articles: t.relation('articles', {
      query(_, { user }) {
        return {
          where: prismaQueryAccessibleArticles(user, 'wants'),
          orderBy: { publishedAt: 'desc' },
        };
      },
    }),
    services: t.relation('services'),
    links: t.relation('links'),
    isMember: t.boolean({
      description: "L'utilisateur.ice connecté.e est membre de ce groupe",
      resolve({ id }, _, { user }) {
        return Boolean(user?.groups.some((m) => m.groupId === id));
      },
    }),
    membership: t.prismaField({
      type: GroupMemberType,
      nullable: true,
      description: "L'adhésion de l'utilisateur.ice connecté.e à ce groupe",
      async resolve(query, { id }, _, { user }) {
        if (!user) return null;
        return prisma.groupMember.findFirst({
          ...query,
          where: {
            groupId: id,
            memberId: user.id,
          },
        });
      },
    }),
    // TODO connection
    members: t.relation('members', {
      query: {
        orderBy: prismaOrderGroupMemberships,
      },
    }),
    membersCount: t.int({
      description: 'Nombre de membres',
      args: {
        yearTiers: t.arg.intList({
          defaultValue: [],
          description:
            "Limiter aux membres de certaines promos (pratique par exemple pour avoir le nombre d'actif.ve.s)",
        }),
      },
      async resolve({ id }, { yearTiers }) {
        return prisma.groupMember.count({
          where: {
            groupId: id,
            ...(yearTiers.length > 0
              ? {
                  member: {
                    graduationYear: { in: yearTiers.map(fromYearTier) },
                  },
                }
              : {}),
          },
        });
      },
    }),
    president: t.prismaField({
      type: 'GroupMember',
      nullable: true,
      resolve: async (query, { id }) =>
        prisma.groupMember.findFirst({ ...query, where: { group: { id }, president: true } }),
    }),
    vicePresidents: t.prismaField({
      type: ['GroupMember'],
      resolve: async (query, { id }) =>
        prisma.groupMember.findMany({ ...query, where: { group: { id }, vicePresident: true } }),
    }),
    secretaries: t.prismaField({
      type: ['GroupMember'],
      resolve: async (query, { id }) =>
        prisma.groupMember.findMany({ ...query, where: { group: { id }, secretary: true } }),
    }),
    treasurers: t.prismaField({
      type: ['GroupMember'],
      resolve: async (query, { id }) =>
        prisma.groupMember.findMany({ ...query, where: { group: { id }, treasurer: true } }),
    }),
    boardMembers: t.prismaField({
      type: ['GroupMember'],
      resolve: async (query, { id }) =>
        prisma.groupMember.findMany({
          ...query,
          where: {
            group: { id },
            OR: [
              { president: true },
              { vicePresident: true },
              { secretary: true },
              { treasurer: true },
            ],
          },
          orderBy: prismaOrderGroupMemberships,
        }),
    }),
    studentAssociation: t.relation('studentAssociation'),
    parent: t.relation('parent', { nullable: true }),
    selfJoinable: t.exposeBoolean('selfJoinable'),
    children: t.relation('children'),
    root: t.relation('familyRoot', { nullable: true }),
    familyChildren: t.relation('familyChildren'),
    related: t.relation('related'),
    canEditMembers: t.boolean({
      description: "Vrai si l'utilisateur·ice connecté·e peut modifier les membres du groupe",
      args: {
        assert: t.arg.string({
          required: false,
          description: "Lève une erreur avec le message donné si la permission n'est pas accordée",
        }),
      },
      resolve: async ({ id: groupId }, _, { user }) => {
        const group = await prisma.group.findUniqueOrThrow({
          where: { id: ensureGlobalId(groupId, 'Group') },
          include: canEditGroupMembers.prismaIncludes,
        });
        return canEditGroupMembers(user, group);
      },
    }),
    canEditDetails: t.boolean({
      description: "Vrai si l'utilisateur·ice connecté·e peut modifier les informations du groupe",
      args: {
        assert: t.arg.string({
          required: false,
          description: "Lève une erreur avec le message donné si la permission n'est pas accordée",
        }),
      },
      resolve: async ({ id }, { assert }, { user }) => {
        const can = canEditGroup(
          user,
          await prisma.group.findUniqueOrThrow({
            where: { id },
            include: canEditGroup.prismaIncludes,
          }),
        );
        if (assert && !can) throw new GraphQLError(assert);
        return can;
      },
    }),
    canEditStudentAssociation: t.boolean({
      description: "On peut modifier l'AE de rattachement",
      args: {
        assert: t.arg.string({
          required: false,
          description: "Lève une erreur avec le message donné si la permission n'est pas accordée",
        }),
      },
      resolve: async (group, { assert }, { user }) => {
        const can = canChangeGroupStudentAssociation(user, group);
        if (assert && !can) throw new GraphQLError(assert);
        return can;
      },
    }),
    canEditType: t.boolean({
      description: 'On peut changer le type de groupe',
      args: {
        assert: t.arg.string({
          required: false,
          description: "Lève une erreur avec le message donné si la permission n'est pas accordée",
        }),
      },
      resolve: async (group, { assert }, { user }) => {
        const can = canChangeGroupType(user, group);
        if (assert && !can) throw new GraphQLError(assert);
        return can;
      },
    }),
    canEditUnlisted: t.boolean({
      description: 'On peut changer le statut de liste de groupe',
      args: {
        assert: t.arg.string({
          required: false,
          description: "Lève une erreur avec le message donné si la permission n'est pas accordée",
        }),
      },
      resolve: async (group, { assert }, { user }) => {
        const can = canChangeGroupType(user, group);
        if (assert && !can) throw new GraphQLError(assert);
        return can;
      },
    }),
    canEditParent: t.boolean({
      description: 'On peut changer le groupe parent',
      args: {
        assert: t.arg.string({
          required: false,
          description: "Lève une erreur avec le message donné si la permission n'est pas accordée",
        }),
      },
      resolve: async (group, { assert }, { user }) => {
        const can = canChangeParentGroup(user, {
          child: group,
          parent: 'any',
        });
        if (assert && !can) throw new GraphQLError(assert);
        return can;
      },
    }),
    canEditJoinPolicy: t.boolean({
      description: "On peut changer la politique d'adhésion au groupe (inscription libre ou non)",
      args: {
        assert: t.arg.string({
          required: false,
          description: "Lève une erreur avec le message donné si la permission n'est pas accordée",
        }),
      },
      resolve: async (group, { assert }, { user }) => {
        const can = canSetGroupJoinPolicy(user, group);
        if (!can && assert) throw new GraphQLError(assert);
        return can;
      },
    }),
    canEditLydiaAccounts: t.boolean({
      description: 'On peut changer les comptes Lydias du groupe',
      args: {
        assert: t.arg.string({
          required: false,
          description: "Lève une erreur avec le message donné si la permission n'est pas accordée",
        }),
      },
      resolve: async (group, { assert }, { user }) => {
        const can = canEditLydiaAccounts(user, group);
        if (!can && assert) throw new GraphQLError(assert);
        return can;
      },
    }),
  }),
});
