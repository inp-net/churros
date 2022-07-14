import { builder } from '../builder.js'
import { prisma } from '../prisma.js'

/** Represents a club, mapped on the underlying database object. */
export const ClubType = builder.prismaObject('Club', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    articles: t.relation('articles'),
    members: t.relation('members', {
      // Seeing group members requires being logged in
      authScopes: { loggedIn: true },
    }),
    school: t.relation('school'),
  }),
})

/** List clubs. */
builder.queryField('clubs', (t) =>
  t.prismaField({
    type: [ClubType],
    resolve: (query) => prisma.club.findMany(query),
  })
)

/** Get a specific club. */
builder.queryField('club', (t) =>
  t.prismaField({
    type: ClubType,
    args: { id: t.arg.id() },
    resolve: (query, _, { id }) =>
      prisma.club.findUniqueOrThrow({
        ...query,
        where: { id },
      }),
  })
)
