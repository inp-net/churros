import { builder, toHtml, yearTier } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { NotificationChannel } from '@prisma/client';
import { FamilyTree, fullName, getFamilyTree } from '../index.js';

/** Represents a user, mapped on the underlying database object. */
export const UserType = builder.prismaNode('User', {
  id: { field: 'id' },
  grantScopes: ({ id, majorId }, { user }) => [
    ...(id === user?.id ? ['me'] : []),
    ...(majorId ? ['student'] : []),
  ],
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

    // Permissions are only visible to admins
    admin: t.exposeBoolean('admin', {
      // authScopes: { admin: true, $granted: 'me' },
    }),
    canEditGroups: t.boolean({
      resolve: ({ admin, canEditGroups }) => admin || canEditGroups,
      authScopes: { admin: true, $granted: 'me' },
    }),
    canEditUsers: t.boolean({
      resolve: ({ admin, canEditUsers }) => admin || canEditUsers,
      authScopes: { admin: true, $granted: 'me' },
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
    familyTree: t.field({
      type: FamilyTree,
      async resolve({ id, godparentId }) {
        return getFamilyTree({ id, godparentId: godparentId ?? undefined });
      },
    }),
    emailChangeRequests: t.relation('emailChanges', {
      authScopes: { $granted: 'me' },
    }),
  }),
});
