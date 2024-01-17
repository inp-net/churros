import { builder, prisma } from '#lib';
import { addDays } from 'date-fns';
import { GraphQLError } from 'graphql';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { phone as parsePhoneNumber } from 'phone';
import { purgeUserSessions } from '../context.js';
import { yearTier } from '../date.js';
import { FamilyTree, getFamilyTree } from '../godchildren-tree.js';
import { updatePicture } from '../pictures.js';
import { markAsContributor, queryLdapUser } from '../services/ldap.js';
import { toHtml } from '../services/markdown.js';
import { createUid } from '../services/registration.js';
import { ContributionOptionType } from './contribution-options.js';
import { requestEmailChange } from './email-changes.js';
import { LinkInput } from './links.js';
import { log } from './logs.js';
import { NotificationChannel } from './notifications.js';
import { DateTimeScalar, FileScalar } from './scalars.js';
import { StudentAssociationType } from './student-associations.js';

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
  grantScopes: ({ id, majorId }, { user }) => [
    ...(id === user?.id ? ['me'] : []),
    ...(majorId ? ['student'] : []),
  ],
  fields: (t) => ({
    majorId: t.exposeID('majorId', { nullable: true }),
    uid: t.exposeString('uid'),
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

/** Returns the current user. */
builder.queryField('me', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: UserType,
    resolve: (_query, _, {}, { user }) => user,
  }),
);

/** Gets a user from its id. */
builder.queryField('user', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: UserType,
    args: { uid: t.arg.string() },
    async resolve(query, _, { uid }) {
      const user = await prisma.user.findUnique({ ...query, where: { uid } });
      if (!user) throw new GraphQLError('Utilisateur·ice introuvable');
      return user;
    },
  }),
);

builder.queryField('userByEmail', (t) =>
  t.prismaField({
    type: UserType,
    args: { email: t.arg.string() },
    authScopes: { loggedIn: true },
    async resolve(query, _, { email }) {
      const user = await prisma.user.findUnique({ ...query, where: { email } });
      if (!user) throw new GraphQLError('Utilisateur·ice introuvable');
      return user;
    },
  }),
);

builder.queryField('allUsers', (t) =>
  t.withAuth({ student: true }).prismaConnection({
    type: UserType,
    async resolve(query) {
      return prisma.user.findMany({
        ...query,
        orderBy: { uid: 'asc' },
      });
    },
    cursor: 'id',
  }),
);

/** Gets the people that were born today */
builder.queryField('birthdays', (t) =>
  t.withAuth({ student: true }).prismaField({
    type: [UserType],
    args: {
      now: t.arg({ type: DateTimeScalar, required: false }),
      activeOnly: t.arg({ type: 'Boolean', required: false }),
      width: t.arg({ type: 'Int', required: false }),
    },
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
        dateRangeAround(now, width).flatMap(async (d) => usersBornOn(d)),
      );

      const users = await prisma.user.findMany({
        ...query,
        where: {
          uid: { in: usersNonflat.flat().map((u) => u.uid) },
          major: {
            schools: {
              some: {
                uid: {
                  in: user.major?.schools.map((s) => s.uid) ?? [],
                  not: 'inp',
                },
              },
            },
          },
        },
      });

      if (activeOnly)
        return users.filter(({ graduationYear }) => [1, 2, 3].includes(yearTier(graduationYear)));
      return users;
    },
  }),
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
      majorId: t.arg.id({ required: false }),
      minorId: t.arg.id({ required: false }),
      graduationYear: t.arg.int({ required: false }),
      email: t.arg.string(),
      otherEmails: t.arg.stringList(),
      birthday: t.arg({ type: DateTimeScalar, required: false }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
      phone: t.arg.string({ validate: { maxLength: 255 } }),
      nickname: t.arg.string({ validate: { maxLength: 255 } }),
      description: t.arg.string({ validate: { maxLength: 10_000 } }),
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
      return user?.canEditUsers || uid === user?.uid;
    },
    async resolve(
      query,
      _,
      {
        uid,
        majorId,
        minorId,
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
      { user },
    ) {
      if (!user) throw new GraphQLError('Connexion requise');
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
          JSON.stringify(
            oldContributions
              .filter((c) => c.paid)
              .map(({ optionId }) => optionId)
              .sort(),
          ) !== JSON.stringify(contributesWith.sort());
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
            user: { uid },
            option: {
              id: {
                notIn: contributesWith,
              },
            },
          },
        });
        for (const optionId of contributesWith) {
          await prisma.contribution.upsert({
            where: { optionId_userId: { optionId, userId: targetUser.id } },
            update: {
              paid: true,
            },
            create: {
              option: { connect: { id: optionId } },
              user: { connect: { id: targetUser.id } },
              paid: true,
            },
          });
        }
      }

      const userUpdated = await prisma.user.update({
        ...query,
        where: { uid },
        data: {
          major: majorId ? { connect: { id: majorId } } : { disconnect: true },
          minor: minorId ? { connect: { id: minorId } } : { disconnect: true },
          graduationYear: graduationYear ?? undefined,
          nickname,
          description,
          address,
          phone,
          birthday,
          firstName: user.canEditUsers || user.admin ? firstName : targetUser.firstName,
          lastName: user.canEditUsers || user.admin ? lastName : targetUser.lastName,
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

      try {
        await markAsContributor(userUpdated.uid);
      } catch (error) {
        await log('ldap-sync', 'mark as contributor', { err: error }, userUpdated.uid);
      }

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
  }),
);

builder.mutationField('syncUserLdap', (t) =>
  t.boolean({
    args: {
      uid: t.arg.string(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin);
    },
    async resolve(_, { uid }) {
      const userDb = await prisma.user.findUnique({
        where: { uid },
        include: {
          contributions: {
            include: {
              option: {
                include: {
                  paysFor: true,
                },
              },
            },
          },
        },
      });
      if (!userDb) return false;
      const userLdap = await queryLdapUser(userDb.uid);
      if (!userLdap) return false;

      if (userDb.graduationYear !== userLdap.promo && userLdap.genre !== 404) {
        const newUid = await createUid(userDb);
        await prisma.user.update({
          where: { uid: userDb.uid },
          data: { uid: newUid },
        });
        console.info(`Updated uid: ${uid} -> ${newUid}`);
      }

      const { uid: finalUid } = await prisma.user.findUniqueOrThrow({ where: { id: userDb.id } });
      if (
        userDb.contributions.some(({ option: { paysFor } }) =>
          paysFor.some(({ name }) => name === 'AEn7'),
        )
      ) {
        try {
          await markAsContributor(finalUid);
        } catch (error: unknown) {
          await log('ldap-sync', 'mark as contributor', { err: error }, finalUid);
        }
      }

      return true;
    },
  }),
);

builder.mutationField('updateUserPermissions', (t) =>
  t.prismaField({
    type: UserType,
    args: {
      uid: t.arg.string(),
      canEditGroups: t.arg.boolean(),
      canEditUsers: t.arg.boolean(),
      canAccessDocuments: t.arg.boolean(),
    },
    authScopes: (_, {}, { user }) => Boolean(user?.admin),
    async resolve(query, _, { uid, canEditGroups, canEditUsers, canAccessDocuments }, { user }) {
      purgeUserSessions(uid);
      const userUpdated = await prisma.user.update({
        ...query,
        where: { uid },
        data: { canEditGroups, canEditUsers, canAccessDocuments },
      });
      await prisma.logEntry.create({
        data: {
          area: 'permission',
          action: 'update',
          target: userUpdated.id,
          message: `Updated user ${userUpdated.uid} permissions: ${JSON.stringify({
            canEditGroups,
            canEditUsers,
            canAccessDocuments,
          })}`,
          user: { connect: { id: user?.id } },
        },
      });
      return userUpdated;
    },
  }),
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
          user: user ? { connect: { id: user.id } } : undefined,
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
  }),
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
          user: { connect: { uid } },
        },
      });
      return true;
    },
  }),
);

builder.mutationField('updateNotificationSettings', (t) =>
  t.field({
    type: [NotificationChannel],
    args: {
      uid: t.arg.string(),
      enabledChannels: t.arg({ type: [NotificationChannel] }),
    },
    authScopes(_, { uid }, { user }) {
      return Boolean(user?.canEditUsers || uid === user?.uid);
    },
    async resolve(_query, { uid, enabledChannels }) {
      const { enabledNotificationChannels } = await prisma.user.update({
        where: { uid },
        data: {
          enabledNotificationChannels: { set: enabledChannels },
        },
      });
      return enabledNotificationChannels;
    },
  }),
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
  }),
);
