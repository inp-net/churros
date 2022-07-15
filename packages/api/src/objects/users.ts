import { GraphQLYogaError } from '@graphql-yoga/node'
import { CredentialType as CredentialPrismaType } from '@prisma/client'
import { hash } from 'argon2'
import imageType from 'image-type'
import { writeFile } from 'node:fs/promises'
import { builder } from '../builder.js'
import { purgeUserSessions } from '../context.js'
import { prisma } from '../prisma.js'
import { DateTimeScalar, FileScalar } from './scalars.js'

/** Represents a user, mapped on the underlying database object. */
export const UserType = builder.prismaObject('User', {
  grantScopes: ({ id }, { user }) => (user?.id === id ? ['me'] : []),
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    firstname: t.exposeString('firstname'),
    lastname: t.exposeString('lastname'),
    nickname: t.exposeString('nickname', { authScopes: { loggedIn: true } }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    pictureFile: t.exposeString('pictureFile', { nullable: true }),

    // Permissions are only visible to admins
    admin: t.exposeBoolean('admin', {
      authScopes: { admin: true, $granted: 'me' },
    }),
    canEditClubs: t.boolean({
      resolve: ({ admin, canEditClubs }) => admin || canEditClubs,
      authScopes: { admin: true, $granted: 'me' },
    }),
    canEditUsers: t.boolean({
      resolve: ({ admin, canEditUsers }) => admin || canEditUsers,
      authScopes: { admin: true, $granted: 'me' },
    }),

    articles: t.relation('articles', { authScopes: { loggedIn: true, $granted: 'me' } }),
    clubs: t.relation('clubs', { authScopes: { loggedIn: true, $granted: 'me' } }),
    credentials: t.relation('credentials', { authScopes: { $granted: 'me' } }),
    major: t.relation('major', { authScopes: { loggedIn: true, $granted: 'me' } }),
  }),
})

/** Returns the current user. */
builder.queryField('me', (t) =>
  // We use `prismaField` instead of `field` to leverage the nesting
  // mechanism of the resolver
  t.prismaField({
    type: UserType,
    authScopes: { loggedIn: true },
    resolve: (query, _, {}, { user }) => user!,
  })
)

/** Gets a user from its id. */
builder.queryField('user', (t) =>
  t.prismaField({
    type: UserType,
    args: { id: t.arg.id() },
    authScopes: { loggedIn: true },
    resolve: async (query, _, { id }) => prisma.user.findUniqueOrThrow({ ...query, where: { id } }),
  })
)

/** Searches for user on all text fields. */
builder.queryField('searchUsers', (t) =>
  t.prismaField({
    type: [UserType],
    args: { q: t.arg.string() },
    authScopes: { loggedIn: true },
    async resolve(query, _, { q }) {
      const terms = new Set(String(q).split(' ').filter(Boolean))
      const search = [...terms].join('&')
      return prisma.user.findMany({
        ...query,
        where: {
          firstname: { search },
          lastname: { search },
          name: { search },
          nickname: { search },
        },
      })
    },
  })
)

/** Registers a new user. */
builder.mutationField('register', (t) =>
  t.prismaField({
    type: UserType,
    args: {
      majorId: t.arg.id(),
      name: t.arg.string({
        validate: {
          minLength: 3,
          maxLength: 20,
          regex: [/[a-z][._a-z-]*/, { message: 'Lettres, -, _ et . seulement' }],
          refine: [
            async (name) => !(await prisma.user.findUnique({ where: { name } })),
            { message: 'Nom déjà utilisé' },
          ],
        },
      }),
      firstname: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      lastname: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      password: t.arg.string({ validate: { minLength: 10, maxLength: 255 } }),
    },
    resolve: async (query, _, { majorId, name, firstname, lastname, password }) =>
      prisma.user.create({
        ...query,
        data: {
          majorId,
          name,
          firstname,
          lastname,
          credentials: {
            create: {
              type: CredentialPrismaType.Password,
              value: await hash(password),
            },
          },
        },
      }),
  })
)

/** Updates a user. */
builder.mutationField('updateUser', (t) =>
  t.prismaField({
    type: UserType,
    args: {
      id: t.arg.id(),
      nickname: t.arg.string({ validate: { maxLength: 255 } }),
    },
    authScopes: (_, { id }, { user }) => Boolean(user?.canEditUsers || id === user?.id),
    async resolve(query, _, { id, nickname }) {
      purgeUserSessions(id)
      return prisma.user.update({ ...query, where: { id }, data: { nickname } })
    },
  })
)

builder.mutationField('updateUserPicture', (t) =>
  t.field({
    type: 'String',
    args: {
      id: t.arg.id(),
      file: t.arg({ type: FileScalar }),
    },
    authScopes: (_, { id }, { user }) => Boolean(user?.canEditUsers || id === user?.id),
    async resolve(_, { id, file }) {
      const { name } = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: { name: true },
      })
      const type = await file
        .slice(0, imageType.minimumBytes)
        .arrayBuffer()
        .then((array) => Buffer.from(array))
        .then((buffer) => imageType(buffer))
      if (!type || (type.ext !== 'png' && type.ext !== 'jpg'))
        throw new GraphQLYogaError('File format not supported')

      const path = `${name}.${type.ext}`
      purgeUserSessions(id)
      await writeFile(new URL(path, process.env.STORAGE), file.stream())
      await prisma.user.update({ where: { id }, data: { pictureFile: path } })
      return path
    },
  })
)
