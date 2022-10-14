import { GraphQLError } from 'graphql';
import imageType, { minimumBytes } from 'image-type';
import { unlink, writeFile } from 'node:fs/promises';
import { phone as parsePhoneNumber } from 'phone';
import { builder } from '../builder.js';
import { purgeUserSessions } from '../context.js';
import { prisma } from '../prisma.js';
import { LinkInput } from './links.js';
import { DateTimeScalar, FileScalar } from './scalars.js';

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
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    graduationYear: t.exposeInt('graduationYear'),

    // Profile details
    address: t.exposeString('address', { authScopes: { loggedIn: true, $granted: 'me' } }),
    description: t.exposeString('description', { authScopes: { loggedIn: true, $granted: 'me' } }),
    birthday: t.expose('birthday', {
      type: DateTimeScalar,
      nullable: true,
      authScopes: { loggedIn: true, $granted: 'me' },
    }),
    linkCollection: t.relation('linkCollection', {
      authScopes: { loggedIn: true, $granted: 'me' },
    }),
    nickname: t.exposeString('nickname', { authScopes: { loggedIn: true, $granted: 'me' } }),
    phone: t.exposeString('phone', { authScopes: { loggedIn: true, $granted: 'me' } }),
    pictureFile: t.exposeString('pictureFile', { authScopes: { loggedIn: true, $granted: 'me' } }),

    // Permissions are only visible to admins
    admin: t.exposeBoolean('admin', {
      authScopes: { admin: true, $granted: 'me' },
    }),
    canEditGroups: t.boolean({
      resolve: ({ admin, canEditGroups }) => admin || canEditGroups,
      authScopes: { admin: true, $granted: 'me' },
    }),
    canEditUsers: t.boolean({
      resolve: ({ admin, canEditUsers }) => admin || canEditUsers,
      authScopes: { admin: true, $granted: 'me' },
    }),

    articles: t.relation('articles', {
      authScopes: { loggedIn: true, $granted: 'me' },
      query: { orderBy: { publishedAt: 'desc' } },
    }),
    groups: t.relation('groups', {
      authScopes: { loggedIn: true, $granted: 'me' },
      query: { orderBy: { group: { name: 'asc' } } },
    }),
    credentials: t.relation('credentials', {
      authScopes: { $granted: 'me' },
      query: { orderBy: { createdAt: 'desc' } },
    }),
    major: t.relation('major', { authScopes: { loggedIn: true, $granted: 'me' } }),
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

/** Searches for user on all text fields. */
builder.queryField('searchUsers', (t) =>
  t.prismaField({
    type: [UserType],
    args: { q: t.arg.string() },
    authScopes: { loggedIn: true },
    async resolve(query, _, { q }) {
      const terms = new Set(String(q).split(' ').filter(Boolean));
      const search = [...terms].join('&');
      return prisma.user.findMany({
        ...query,
        where: {
          firstName: { search },
          lastName: { search },
          uid: { search },
          nickname: { search },
        },
      });
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
      birthday: t.arg({ type: DateTimeScalar, required: false }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
      phone: t.arg.string({ validate: { maxLength: 255 } }),
      nickname: t.arg.string({ validate: { maxLength: 255 } }),
      description: t.arg.string({ validate: { maxLength: 255 } }),
      links: t.arg({ type: [LinkInput] }),
    },
    authScopes: (_, { uid }, { user }) => Boolean(user?.canEditUsers || uid === user?.uid),
    async resolve(
      query,
      _,
      { uid, majorId, graduationYear, nickname, description, links, address, phone, birthday }
    ) {
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
          linkCollection: { update: { links: { deleteMany: {}, createMany: { data: links } } } },
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

      const path = `${uid}.${type.ext}`;
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
