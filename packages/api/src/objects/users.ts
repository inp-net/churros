import { GraphQLError } from 'graphql';
import imageType, { minimumBytes } from 'image-type';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { phone as parsePhoneNumber } from 'phone';
import { builder } from '../builder.js';
import { purgeUserSessions } from '../context.js';
import { prisma } from '../prisma.js';
import { LinkInput } from './links.js';
import { DateTimeScalar, FileScalar } from './scalars.js';
import { requestEmailChange } from './email-changes.js';
import {
  type FuzzySearchResult,
  splitSearchTerms,
  levenshteinSorter,
  levenshteinFilterAndSort,
} from '../services/search.js';
import type { Group, User } from '@prisma/client';
import { dirname, join } from 'node:path';
import { NotificationTypeEnum } from './notifications.js';
import { FamilyTree, getFamilyTree } from '../godchildren-tree.js';
import { yearTier } from '../date.js';
import { addDays } from 'date-fns';

builder.objectType(FamilyTree, {
  name: 'FamilyTree',
  fields: (t) => ({
    nesting: t.exposeString('nesting'),
    users: t.expose('users', { type: [UserType] }),
  }),
});

export function fullName(user: { firstName: string; lastName: string; nickname?: string }) {
  const { firstName, lastName, nickname } = user;
  if (nickname) return `${nickname} (${firstName} ${lastName})`;
  return `${firstName} ${lastName}`;
}

/** Represents a user, mapped on the underlying database object. */
export const UserType = builder.prismaNode('User', {
  id: { field: 'id' },
  grantScopes: ({ id }, { user }) => (user?.id === id ? ['me'] : []),
  fields: (t) => ({
    majorId: t.exposeID('majorId'),
    uid: t.exposeString('uid'),
    email: t.exposeString('email', { authScopes: { loggedIn: true, $granted: 'me' } }),
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

    // Profile details
    address: t.exposeString('address', { authScopes: { loggedIn: true, $granted: 'me' } }),
    description: t.exposeString('description', { authScopes: { loggedIn: true, $granted: 'me' } }),
    birthday: t.expose('birthday', {
      type: DateTimeScalar,
      nullable: true,
      authScopes: { loggedIn: true, $granted: 'me' },
    }),
    links: t.relation('links', {
      authScopes: { loggedIn: true, $granted: 'me' },
    }),
    nickname: t.exposeString('nickname', { authScopes: { loggedIn: true, $granted: 'me' } }),
    phone: t.exposeString('phone', { authScopes: { loggedIn: true, $granted: 'me' } }),
    pictureFile: t.exposeString('pictureFile'),

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
    articles: t.relatedConnection('articles', {
      cursor: 'id',
      authScopes: { loggedIn: true, $granted: 'me' },
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
    major: t.relation('major', { authScopes: { loggedIn: true, $granted: 'me' } }),
    managedEvents: t.relation('managedEvents'),
    notificationSettings: t.relation('notificationSettings', {
      authScopes: { loggedIn: true, $granted: 'me' },
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

export const NotificationSettingType = builder.prismaObject('NotificationSetting', {
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.expose('type', { type: NotificationTypeEnum }),
    allow: t.exposeBoolean('allow'),
    groupId: t.exposeID('groupId', { nullable: true }),
    group: t.relation('group', { nullable: true }),
  }),
});

export const NotificationSettingInput = builder.inputType('NotificationSettingsInput', {
  fields: (t) => ({
    type: t.field({ type: NotificationTypeEnum }),
    allow: t.boolean(),
    groupUid: t.string({ required: false }),
  }),
});

/** Returns the current user. */
builder.queryField('me', (t) =>
  // We use `prismaField` instead of `field` to leverage the nesting
  // mechanism of the resolver
  t.prismaField({
    type: UserType,
    authScopes: { loggedIn: true },
    resolve: (_query, _, {}, { user }) => user!,
  })
);

/** Gets a user from its id. */
builder.queryField('user', (t) =>
  t.prismaField({
    type: UserType,
    args: { uid: t.arg.string() },
    authScopes: { loggedIn: true },
    resolve: async (query, _, { uid }) =>
      prisma.user.findUniqueOrThrow({ ...query, where: { uid } }),
  })
);

builder.queryField('allUsers', (t) =>
  t.prismaConnection({
    type: UserType,
    async resolve(query) {
      return prisma.user.findMany({
        ...query,
        orderBy: { uid: 'asc' },
      });
    },
    cursor: 'id',
  })
);

/** Searches for user on all text fields. */
builder.queryField('searchUsers', (t) =>
  t.prismaField({
    type: [UserType],
    args: { q: t.arg.string() },
    authScopes: { loggedIn: true },
    async resolve(query, _, { q }) {
      const { numberTerms, searchString: search } = splitSearchTerms(q);
      const searchResults: FuzzySearchResult = await prisma.$queryRaw`
SELECT "id", levenshtein_less_equal(LOWER(unaccent("firstName" ||' '|| "lastName")), LOWER(unaccent(${q})), 20) as changes
FROM "User"
ORDER BY changes ASC
LIMIT 10
`;

      const users = await prisma.user.findMany({
        ...query,
        where: {
          OR: [
            { firstName: { search } },
            { lastName: { search } },
            { uid: { search } },
            { nickname: { search } },
            { major: { name: { search } } },
            { graduationYear: { in: numberTerms } },
          ],
        },
      });

      const fuzzyUsers = await prisma.user.findMany({
        ...query,
        where: { id: { in: searchResults.map(({ id }) => id) } },
      });

      return [
        ...users.sort(levenshteinSorter(searchResults)),
        ...levenshteinFilterAndSort<User>(
          searchResults,
          5,
          users.map(({ id }) => id)
        )(fuzzyUsers),
      ];
    },
  })
);

/** Gets the people that were born today */
builder.queryField('birthdays', (t) =>
  t.prismaField({
    type: [UserType],
    args: {
      now: t.arg({ type: DateTimeScalar, required: false }),
      activeOnly: t.arg({ type: 'Boolean', required: false }),
      width: t.arg({ type: 'Int', required: false }),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { now, activeOnly, width }, { user }) {
      now = now ?? new Date();
      activeOnly = activeOnly ?? true;
      width = width ?? 1;

      async function usersBornOn(date: Date): Promise<Array<{ uid: string }>> {
        return prisma.$queryRaw`SELECT uid from "User" WHERE EXTRACT(DAY FROM "birthday") = EXTRACT(DAY FROM ${date}) AND EXTRACT(MONTH FROM "birthday") = EXTRACT(MONTH FROM ${date})`;
      }

      function dateRangeAround(center: Date, width: number): Date[] {
        width = Math.ceil(width / 2) * 2;
        const result = [];
        for (
          let date = addDays(center, -width / 2);
          date <= addDays(center, width / 2);
          date = addDays(date, 1)
        )
          result.push(date);

        return result;
      }

      const usersNonflat = await Promise.all(
        dateRangeAround(now, width).flatMap(async (d) => usersBornOn(d))
      );

      const users = await prisma.user.findMany({
        ...query,
        where: {
          uid: { in: usersNonflat.flat().map((u) => u.uid) },
          ...(user
            ? {
                major: {
                  schools: {
                    some: {
                      uid: {
                        in: user.major.schools.map((s) => s.uid),
                      },
                    },
                  },
                },
              }
            : {}),
        },
      });
      if (activeOnly)
        return users.filter(({ graduationYear }) => [1, 2, 3].includes(yearTier(graduationYear)));
      return users;
    },
  })
);

/** Updates a user. */
builder.mutationField('updateUser', (t) =>
  t.prismaField({
    type: UserType,
    errors: {},
    args: {
      uid: t.arg.string(),
      majorId: t.arg.id(),
      graduationYear: t.arg.int(),
      email: t.arg.string(),
      birthday: t.arg({ type: DateTimeScalar, required: false }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
      phone: t.arg.string({ validate: { maxLength: 255 } }),
      nickname: t.arg.string({ validate: { maxLength: 255 } }),
      description: t.arg.string({ validate: { maxLength: 255 } }),
      links: t.arg({ type: [LinkInput] }),
      godparentUid: t.arg.string({ required: false }),
    },
    authScopes: (_, { uid }, { user }) => Boolean(user?.canEditUsers || uid === user?.uid),
    async resolve(
      query,
      _,
      {
        uid,
        majorId,
        email,
        graduationYear,
        nickname,
        description,
        links,
        address,
        phone,
        birthday,
        godparentUid,
      },
      { user }
    ) {
      if (!user) throw new GraphQLError('Not logged in');

      if (phone) {
        const { isValid, phoneNumber } = parsePhoneNumber(phone, { country: 'FRA' });
        if (isValid) {
          phone = phoneNumber;
        } else {
          const { isValid, phoneNumber } = parsePhoneNumber(phone);
          if (!isValid) throw new Error('Numéro de téléphone invalide');
          phone = phoneNumber;
        }
      }

      const { email: oldEmail } = await prisma.user.findUniqueOrThrow({ where: { uid } });
      const changingEmail = email !== oldEmail;

      if (changingEmail) {
        console.log(`Updating mail: ${oldEmail} -> ${email}`);
        // Check if new email is available
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new GraphQLError('Cet e-mail est déjà utilisé');
        // Delete all pending password resets for user
        await prisma.passwordReset.deleteMany({
          where: {
            user: {
              email: { in: [email, oldEmail] },
            },
          },
        });
        // Send a validation email
        await requestEmailChange(email, user.id);
      }

      purgeUserSessions(uid);
      return prisma.user.update({
        ...query,
        where: { uid },
        data: {
          major: { connect: { id: majorId } },
          graduationYear,
          nickname,
          description,
          address,
          phone,
          birthday,
          links: { deleteMany: {}, createMany: { data: links } },
          godparent: godparentUid ? { connect: { uid: godparentUid } } : { disconnect: true },
        },
      });
    },
  })
);

builder.mutationField('updateUserPermissions', (t) =>
  t.prismaField({
    type: UserType,
    args: {
      uid: t.arg.string(),
      admin: t.arg.boolean(),
      canEditGroups: t.arg.boolean(),
      canEditUsers: t.arg.boolean(),
    },
    authScopes: (_, {}, { user }) => Boolean(user?.admin),
    async resolve(query, _, { uid, admin, canEditGroups, canEditUsers }) {
      purgeUserSessions(uid);
      return prisma.user.update({
        ...query,
        where: { uid },
        data: { admin, canEditGroups, canEditUsers },
      });
    },
  })
);

builder.mutationField('updateUserPicture', (t) =>
  t.field({
    type: 'String',
    args: {
      uid: t.arg.string(),
      file: t.arg({ type: FileScalar }),
    },
    authScopes: (_, { uid }, { user }) => Boolean(user?.canEditUsers || uid === user?.uid),
    async resolve(_, { uid, file }) {
      const type = await file
        .slice(0, minimumBytes)
        .arrayBuffer()
        .then((array) => Buffer.from(array))
        .then(async (buffer) => imageType(buffer));
      if (!type || (type.ext !== 'png' && type.ext !== 'jpg'))
        throw new GraphQLError('File format not supported');

      // Delete the existing picture
      const { pictureFile } = await prisma.user.findUniqueOrThrow({
        where: { uid },
        select: { pictureFile: true },
      });

      if (pictureFile) await unlink(new URL(pictureFile, process.env.STORAGE));

      const path = join(`users`, `${uid}.${type.ext}`);
      await mkdir(new URL(dirname(path), process.env.STORAGE), { recursive: true });
      purgeUserSessions(uid);
      await writeFile(new URL(path, process.env.STORAGE), file.stream());
      await prisma.user.update({ where: { uid }, data: { pictureFile: path } });
      return path;
    },
  })
);

builder.mutationField('deleteUserPicture', (t) =>
  t.field({
    type: 'Boolean',
    args: { uid: t.arg.string() },
    authScopes: (_, { uid }, { user }) => Boolean(user?.canEditUsers || uid === user?.uid),
    async resolve(_, { uid }) {
      const { pictureFile } = await prisma.user.findUniqueOrThrow({
        where: { uid },
        select: { pictureFile: true },
      });

      if (pictureFile) await unlink(new URL(pictureFile, process.env.STORAGE));

      await prisma.user.update({
        where: { uid },
        data: { pictureFile: '' },
      });
      return true;
    },
  })
);

builder.mutationField('updateNotificationSettings', (t) =>
  t.prismaField({
    type: [NotificationSettingType],
    args: {
      uid: t.arg.string(),
      notificationSettings: t.arg({ type: [NotificationSettingInput] }),
    },
    authScopes(_, { uid }, { user }) {
      return Boolean(user?.canEditUsers || uid === user?.uid);
    },
    async resolve(query, _, { uid, notificationSettings }) {
      const user = await prisma.user.findUniqueOrThrow({ where: { uid } });

      for (const { groupUid, type, allow } of notificationSettings) {
        let group: Group | undefined;
        if (groupUid) {
          group =
            (await prisma.group.findUnique({
              where: { uid: groupUid },
            })) ?? undefined;
        }

        const notificationSetting = await prisma.notificationSetting.findFirst({
          where: {
            userId: user.id,
            type,
            // eslint-disable-next-line unicorn/no-null
            groupId: group?.id ?? null,
          },
        });

        await prisma.notificationSetting.upsert({
          where: { id: notificationSetting?.id ?? '' },
          create: {
            userId: user.id,
            type,
            allow,
            // eslint-disable-next-line unicorn/no-null
            groupId: group?.id ?? null,
          },
          update: {
            allow,
            type,
            // eslint-disable-next-line unicorn/no-null
            groupId: group?.id ?? null,
          },
        });
      }

      return prisma.notificationSetting.findMany({
        ...query,
        where: { userId: user.id },
      });
    },
  })
);

builder.mutationField('deleteGodchild', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      parentUid: t.arg.string(),
      godchildUid: t.arg.string(),
    },
    async resolve(_, { parentUid, godchildUid }) {
      const parent = await prisma.user.findUniqueOrThrow({ where: { uid: parentUid } });
      const godchild = await prisma.user.findUniqueOrThrow({ where: { uid: godchildUid } });
      if (parent.godparentId !== godchild.id) return false;
      await prisma.user.update({
        where: {
          uid: godchildUid,
        },
        data: {
          godparent: { disconnect: true },
        },
      });
      return true;
    },
  })
);
