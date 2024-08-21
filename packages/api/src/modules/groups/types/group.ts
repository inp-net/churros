import { builder, ensureGlobalId, fromYearTier, prisma, toHtml } from '#lib';
import { DateTimeScalar, Email, HTMLScalar } from '#modules/global';
import { prismaQueryAccessibleArticles } from '#permissions';
import { PicturedInterface } from '../../global/types/pictured.js';
import { canEditGroup, GroupEnumType } from '../index.js';
import {
  canEditGroupMembers,
  canSetGroupRoomOpenState,
  requiredPrismaIncludesForPermissions,
} from '../utils/index.js';

export const GroupTypePrismaIncludes = requiredPrismaIncludesForPermissions;

export const GroupType = builder.prismaNode('Group', {
  id: { field: 'id' },
  include: GroupTypePrismaIncludes,
  interfaces: [PicturedInterface],
  fields: (t) => ({
    // Because `id` is a Relay id, expose `groupId` as the real db id
    groupId: t.exposeID('id'),
    type: t.expose('type', { type: GroupEnumType }),
    uid: t.exposeString('uid'),
    parentId: t.exposeID('parentId', { nullable: true }),
    familyId: t.exposeID('familyId', { nullable: true }),
    name: t.exposeString('name'),
    color: t.exposeString('color'),
    address: t.exposeString('address'),
    description: t.exposeString('description'),
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
    roomIsOpen: t.exposeBoolean('roomIsOpen', { authScopes: { student: true } }),
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
    // TODO connection
    members: t.relation('members', {
      // marche pas même quand ça devrait
      // authScopes: { student: true },
      query: {
        orderBy: [
          { president: 'desc' },
          { treasurer: 'desc' },
          { member: { firstName: 'asc' } },
          { member: { lastName: 'asc' } },
        ],
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
      resolve: async (group, _, { user }) => {
        return canEditGroup(user, group);
      },
    }),
  }),
});
