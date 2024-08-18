import { builder, prisma, toHtml, yearTier } from '#lib';
import { DateTimeScalar, Email, HTMLScalar, PicturedInterface } from '#modules/global';
import { userIsStudent } from '#permissions';
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
    otherEmails: t.field({
      type: [Email],
      nullable: true,
      resolve: ({ otherEmails }, _, { user }) => (userIsStudent(user) ? otherEmails : null),
    }),
    email: t.field({
      type: Email,
      nullable: true,
      resolve: ({ email }, _, { user }) => (userIsStudent(user) ? email || null : null),
    }),
    schoolEmail: t.field({
      type: Email,
      nullable: true,
      resolve: ({ schoolEmail }, _, { user }) => (userIsStudent(user) ? schoolEmail || null : null),
    }),
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
    address: t.string({
      nullable: true,
      resolve({ address, id }, _, { user }) {
        return id === user?.id || userIsStudent(user) ? address : null;
      },
    }),
    description: t.exposeString('description'),
    descriptionHtml: t.field({
      type: HTMLScalar,
      async resolve({ description }) {
        return toHtml(description);
      },
    }),
    birthday: t.field({
      type: DateTimeScalar,
      nullable: true,
      resolve({ birthday, id }, _, { user }) {
        return id === user?.id || userIsStudent(user) ? birthday : null;
      },
    }),
    links: t.relation('links'),
    nickname: t.exposeString('nickname'),
    phone: t.string({
      nullable: true,
      resolve({ phone, id }, _, { user }) {
        return id === user?.id || userIsStudent(user) ? phone : null;
      },
    }),
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
    lydiaPhone: t.exposeString('lydiaPhone', {
      nullable: true,
      authScopes: { $granted: 'me' },
    }),
    major: t.relation('major', { nullable: true }),
    minor: t.relation('minor', { nullable: true }),
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
