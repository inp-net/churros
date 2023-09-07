import { GraphQLError } from 'graphql';
import { unlink } from 'node:fs/promises';
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
  sanitizeOperators,
} from '../services/search.js';
import type { Group, User } from '@prisma/client';
import { NotificationTypeEnum } from './notifications.js';
import { FamilyTree, getFamilyTree } from '../godchildren-tree.js';
import { yearTier } from '../date.js';
import { addDays } from 'date-fns';
import { StudentAssociationType } from './student-associations.js';
import { updatePicture } from '../pictures.js';
import { join } from 'node:path';
import { ContributionOptionType } from './contribution-options.js';

builder.objectType(FamilyTree, {
  name: 'FamilyTree',
  fields: (t) => ({
    nesting: t.exposeString('nesting'),
    users: t.expose('users', { type: [UserType] }),
  }),
});

export function fullName(user: { firstName: string; lastName: string; nickname?: string }) {
  const { firstName, lastName, nickname } = user;
  if (nickname) return `${firstName} ${lastName} (${nickname})`;
  return `${firstName} ${lastName}`;
}

/** Represents a user, mapped on the underlying database object. */
export const UserType = builder.prismaNode('User', {
  id: { field: 'id' },
  grantScopes: ({ id }, { user }) => (user?.id === id ? ['me'] : []),
  fields: (t) => ({
    majorId: t.exposeID('majorId'),
    uid: t.exposeString('uid'),
    otherEmails: t.expose('otherEmails', {
      type: ['String'],
      authScopes: { loggedIn: true, $granted: 'me' },
    }),
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
    contributesWith: t.field({
      type: [ContributionOptionType],
      async resolve({ id }) {
        return prisma.contributionOption.findMany({
          where: {
            contributions: {
              some: {
                user: {
                  id,
                },
                paid: true,
              },
            },
          },
        });
      },
    }),
    contributesTo: t.field({
      type: [StudentAssociationType],
      async resolve({ id }) {
        return prisma.studentAssociation.findMany({
          where: {
            contributionOptions: {
              some: {
                contributions: {
                  some: {
                    user: {
                      id,
                    },
                    paid: true,
                  },
                },
              },
            },
          },
        });
      },
    }),
    pendingContributions: t.field({
      type: [ContributionOptionType],
      async resolve({ id }) {
        return prisma.contributionOption.findMany({
          where: {
            contributions: {
              some: {
                user: {
                  id,
                },
                paid: false,
              },
            },
          },
        });
      },
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
      q = sanitizeOperators(q).trim();
      const { numberTerms, searchString: search } = splitSearchTerms(q);
      const searchResults: FuzzySearchResult = await prisma.$queryRaw`
SELECT "id", levenshtein_less_equal(LOWER(unaccent("firstName" ||' '|| "lastName")), LOWER(unaccent(${q})), 10) as changes
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
                        not: 'inp',
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
      firstName: t.arg.string(),
      lastName: t.arg.string(),
      majorId: t.arg.id(),
      graduationYear: t.arg.int({ required: false }),
      email: t.arg.string(),
      otherEmails: t.arg.stringList(),
      birthday: t.arg({ type: DateTimeScalar, required: false }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
      phone: t.arg.string({ validate: { maxLength: 255 } }),
      nickname: t.arg.string({ validate: { maxLength: 255 } }),
      description: t.arg.string({ validate: { maxLength: 255 } }),
      links: t.arg({ type: [LinkInput] }),
      cededImageRightsToTVn7: t.arg.boolean(),
      apprentice: t.arg.boolean(),
      godparentUid: t.arg.string({
        required: false,
        description:
          'An empty string removes the godparent. Passing null (or undefined) does not update the godparent. An uid sets the godparent to that uid.',
      }),
      contributesWith: t.arg({ type: ['ID'], required: false }),
    },
    authScopes(_, { uid }, { user }) {
      const result = Boolean(user?.canEditUsers || uid === user?.uid);
      if (!result) {
        console.error(
          `Cannot edit profile: ${uid} =?= ${user?.uid ?? '<none>'} OR ${JSON.stringify(
            user?.canEditUsers
          )}`
        );
      }

      return result;
    },
    async resolve(
      query,
      _,
      {
        uid,
        majorId,
        email,
        otherEmails,
        graduationYear,
        nickname,
        description,
        links,
        address,
        phone,
        birthday,
        godparentUid,
        contributesWith,
        cededImageRightsToTVn7,
        apprentice,
        firstName,
        lastName,
      },
      { user }
    ) {
      if (!user) throw new GraphQLError('Not logged in');

      const targetUser = await prisma.user.findUniqueOrThrow({ where: { uid } });

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

      const {
        email: oldEmail,
        graduationYear: oldGraduationYear,
        contributions: oldContributions,
      } = await prisma.user.findUniqueOrThrow({
        where: { uid },
        include: { contributions: true },
      });

      const changingEmail = email !== oldEmail;
      const changingGraduationYear = graduationYear !== oldGraduationYear;
      let changingContributesWith = false;
      if (contributesWith) {
        changingContributesWith =
          JSON.stringify(oldContributions.map(({ optionId }) => optionId).sort()) !==
          JSON.stringify(contributesWith.sort());
      }

      if (changingEmail) {
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
        await requestEmailChange(email, targetUser.id);
      }

      if (!(user.canEditUsers || user.admin) && changingGraduationYear)
        throw new GraphQLError('Not authorized to change graduation year');

      purgeUserSessions(uid);
      if (changingContributesWith && contributesWith && (user.canEditUsers || user.admin)) {
        await prisma.contribution.deleteMany({
          where: {
            option: {
              id: {
                notIn: contributesWith,
              },
            },
          },
        });
        await prisma.contribution.createMany({
          data: contributesWith.map((id) => ({
            optionId: id,
            userId: targetUser.id,
            paid: true,
          })),
          skipDuplicates: true,
        });
      }

      const userUpdated = await prisma.user.update({
        ...query,
        where: { uid },
        data: {
          major: { connect: { id: majorId } },
          graduationYear: graduationYear ?? undefined,
          nickname,
          description,
          address,
          phone,
          birthday,
          firstName,
          lastName,
          cededImageRightsToTVn7,
          apprentice,
          links: { deleteMany: {}, createMany: { data: links } },
          otherEmails: { set: otherEmails.filter(Boolean) },
          godparent:
            godparentUid === ''
              ? { disconnect: true }
              : godparentUid
              ? { connect: { uid: godparentUid } }
              : {},
        },
      });
      await prisma.logEntry.create({
        data: {
          area: 'user',
          action: 'update',
          target: userUpdated.id,
          message: `Updated user ${userUpdated.uid}`,
          user: { connect: { id: user.id } },
        },
      });
      return userUpdated;
    },
  })
);

builder.mutationField('updateUserPermissions', (t) =>
  t.prismaField({
    type: UserType,
    args: {
      uid: t.arg.string(),
      canEditGroups: t.arg.boolean(),
      canEditUsers: t.arg.boolean(),
    },
    authScopes: (_, {}, { user }) => Boolean(user?.admin),
    async resolve(query, _, { uid, canEditGroups, canEditUsers }, { user }) {
      purgeUserSessions(uid);
      const userUpdated = await prisma.user.update({
        ...query,
        where: { uid },
        data: { canEditGroups, canEditUsers },
      });
      await prisma.logEntry.create({
        data: {
          area: 'permission',
          action: 'update',
          target: userUpdated.id,
          message: `Updated user ${userUpdated.uid} permissions: ${JSON.stringify({
            canEditGroups,
            canEditUsers,
          })}`,
          user: { connect: { id: user?.id } },
        },
      });
      return userUpdated;
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
    async resolve(_, { uid, file }, { user }) {
      await prisma.logEntry.create({
        data: {
          area: 'user',
          action: 'update',
          target: user?.id ?? '',
          message: `Updated user ${uid} picture`,
          user: { connect: { id: user?.id ?? '' } },
        },
      });
      return updatePicture({
        resource: 'user',
        folder: 'users',
        extension: 'png',
        file,
        identifier: uid,
      });
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

      const root = new URL(process.env.STORAGE).pathname;

      if (pictureFile) await unlink(join(root, pictureFile));

      await prisma.user.update({
        where: { uid },
        data: { pictureFile: '' },
      });
      await prisma.logEntry.create({
        data: {
          area: 'user',
          action: 'update',
          target: uid,
          message: `Deleted user ${uid} picture`,
          user: { connect: { id: uid } },
        },
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
      await prisma.logEntry.create({
        data: {
          area: 'godparent',
          action: 'delete',
          target: godchild.id,
          message: `Deleted godchild ${godchild.uid}`,
          user: { connect: { id: parent.id } },
        },
      });
      return true;
    },
  })
);
