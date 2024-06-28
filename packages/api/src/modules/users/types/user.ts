import { builder, prisma, toHtml, yearTier } from '#lib';
import { DateTimeScalar, PicturedInterface } from '#modules/global';
import { NotificationChannel } from '@churros/db/prisma';
import { canBeEdited, fullName } from '../index.js';

/** Represents a user, mapped on the underlying database object. */
export const UserType = builder.prismaNode('User', {
  id: { field: 'id' },
  interfaces: [PicturedInterface],
  grantScopes: ({ id, majorId }, { user }) => [
    ...(id === user?.id ? ['me'] : []),
    ...(majorId ? ['student'] : []),
  ],
  include: {
    adminOfStudentAssociations: true,
    canEditGroups: true,
  },
  fields: (t) => ({
    majorId: t.exposeID('majorId', { nullable: true }),
    uid: t.exposeString('uid'),
    schoolUid: t.exposeString('schoolUid', {
      nullable: true,
      authScopes: { student: true, $granted: 'me' },
    }),
    otherEmails: t.expose('otherEmails', {
      type: ['String'],
      authScopes: { student: true, $granted: 'me' },
    }),
    email: t.exposeString('email', { authScopes: { student: true, $granted: 'me' } }),
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName'),
    fullName: t.field({
      type: 'String',
      resolve: (user) => fullName(user),
    }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    graduationYear: t.exposeInt('graduationYear'),
    yearTier: t.int({
      resolve({ graduationYear }) {
        return yearTier(graduationYear);
      },
    }),
    external: t.boolean({
      resolve({ majorId }) {
        return !majorId;
      },
    }),
    bot: t.exposeBoolean('bot', {
      description:
        'Vrai si cet utilisateur est un bot (i.e. ne représente pas une personne physique)',
    }),
    latestVersionSeenInChangelog: t.exposeString('latestVersionSeenInChangelog'),

    // Profile details
    address: t.exposeString('address', { authScopes: { student: true, $granted: 'me' } }),
    description: t.exposeString('description', { authScopes: { student: true, $granted: 'me' } }),
    descriptionHtml: t.string({
      async resolve({ description }) {
        return toHtml(description);
      },
    }),
    birthday: t.expose('birthday', {
      type: DateTimeScalar,
      nullable: true,
      authScopes: { student: true, $granted: 'me' },
    }),
    links: t.relation('links', {
      authScopes: { student: true, $granted: 'me' },
    }),
    nickname: t.exposeString('nickname', { authScopes: { student: true, $granted: 'me' } }),
    phone: t.exposeString('phone', { authScopes: { student: true, $granted: 'me' } }),
    pictureFile: t.exposeString('pictureFile'),
    cededImageRightsToTVn7: t.exposeBoolean('cededImageRightsToTVn7'),
    apprentice: t.exposeBoolean('apprentice'),

    admin: t.exposeBoolean('admin'),
    adminOf: t.boolean({
      description: "Vrai si cette personne est administratrice de l'association étudiante donnée",
      args: { studentAssociation: t.arg.string({ description: "UID de l'association étudiante" }) },
      resolve: async ({ id }, { studentAssociation }) => {
        const user = await prisma.user.findUniqueOrThrow({
          where: { id },
          select: {
            id: true,
            adminOfStudentAssociations: { select: { uid: true } },
            canEditGroups: { select: { uid: true } },
          },
        });
        return user.adminOfStudentAssociations.some((a) => a.uid === studentAssociation);
      },
    }),
    canBeEdited: t.boolean({
      async resolve({ id }, _, { user: me }) {
        // id = ID de cet user
        // user = l'user connecté
        if (!me) return false;
        const user = await prisma.user.findUniqueOrThrow({
          where: { id },
          select: {
            id: true,
            major: {
              select: { schools: { select: { studentAssociations: { select: { id: true } } } } },
            },
          },
        });
        return canBeEdited(user, me);
      },
    }),
    studentAssociationAdmin: t.boolean({
      description:
        "Vrai si cette personne est administratrice d'au moins une association étudiante",
      resolve: ({ adminOfStudentAssociations }) => adminOfStudentAssociations.length > 0,
    }),
    canEditGroup: t.boolean({
      description: 'Vrai si cette personne peut éditer le groupe donné',
      args: { uid: t.arg.string({ description: 'UID du groupe' }) },
      resolve: async ({ id }, { uid: groupUid }) => {
        const { studentAssociationId } = await prisma.group.findUniqueOrThrow({
          where: { uid: groupUid },
          select: { studentAssociationId: true },
        });

        const user = await prisma.user.findUniqueOrThrow({
          where: { id },
          select: {
            id: true,
            adminOfStudentAssociations: { select: { id: true } },
            canEditGroups: { select: { id: true } },
            admin: true,
          },
        });

        return (
          (user.adminOfStudentAssociations?.some((a) => a.id === studentAssociationId) ?? false) ||
          (user.canEditGroups?.some((a) => a.id === studentAssociationId) ?? false) ||
          user.admin
        );
      },
    }),
    canEditGroups: t.boolean({
      description: 'Vrai si cette personne peut éditer des groupes',
      resolve: async ({ id }) => {
        const user = await prisma.user.findUniqueOrThrow({
          where: { id },
          select: {
            id: true,
            canEditGroups: { select: { uid: true } },
          },
        });

        return user.canEditGroups.length > 0;
      },
    }),
    canAccessDocuments: t.boolean({
      resolve: ({ admin, canAccessDocuments }) => admin || canAccessDocuments,
      authScopes: { admin: true, $granted: 'me' },
    }),
    articles: t.relatedConnection('articles', {
      cursor: 'id',
      authScopes: { student: true, $granted: 'me' },
      query: { orderBy: { publishedAt: 'desc' } },
    }),
    groups: t.relation('groups', {
      // authScopes: { loggedIn: true, $granted: 'me' },
      query: { orderBy: { group: { name: 'asc' } } },
    }),
    credentials: t.relation('credentials', {
      authScopes: { $granted: 'me' },
      query: { orderBy: { createdAt: 'desc' } },
    }),
    major: t.relation('major', { nullable: true, authScopes: { student: true, $granted: 'me' } }),
    minor: t.relation('minor', { nullable: true, authScopes: { student: true, $granted: 'me' } }),
    managedEvents: t.relation('managedEvents'),
    enabledNotificationChannels: t.expose('enabledNotificationChannels', {
      type: [NotificationChannel],
      authScopes: { student: true, $granted: 'me' },
    }),
    godparent: t.relation('godparent', { nullable: true }),
    godchildren: t.relation('godchildren'),
    outgoingGodparentRequests: t.relation('outgoingGodparentRequests'),
    incomingGodparentRequests: t.relation('incomingGodparentRequests'),
    emailChangeRequests: t.relation('emailChanges', {
      authScopes: { $granted: 'me' },
    }),
  }),
});
