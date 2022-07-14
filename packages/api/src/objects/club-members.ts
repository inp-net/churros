import { builder } from '../builder.js'
import { prisma } from '../prisma.js'
import { DateTimeScalar } from './scalars.js'

/**
 * Represents a club member, mapped on the underlying database object.
 *
 * This is the intermediate object in the many to many relationship.
 */
export const ClubMemberType = builder.prismaObject('ClubMember', {
  fields: (t) => ({
    memberId: t.exposeID('memberId'),
    clubId: t.exposeID('clubId'),
    title: t.string({ resolve: ({ title }) => title || 'Membre' }),
    president: t.exposeBoolean('president'),
    treasurer: t.exposeBoolean('treasurer'),
    canEditMembers: t.exposeBoolean('canEditMembers'),
    canEditArticles: t.exposeBoolean('canEditArticles'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    member: t.relation('member'),
    club: t.relation('club'),
  }),
})

/** Adds a member to a club. The member is found by their name. */
builder.mutationField('addClubMember', (t) =>
  t.prismaField({
    type: ClubMemberType,
    args: {
      clubId: t.arg.id(),
      name: t.arg.string(),
      title: t.arg.string(),
    },
    authScopes: (_, { clubId }, { user }) =>
      Boolean(
        user?.canEditClubs ||
          user?.clubs.some(({ clubId: id, canEditMembers }) => canEditMembers && clubId === id)
      ),
    resolve: (query, _, { clubId, name, title }) =>
      prisma.clubMember.create({
        ...query,
        data: {
          member: { connect: { name } },
          club: { connect: { id: clubId } },
          title,
        },
      }),
  })
)

/** Removes a member from a club. */
builder.mutationField('deleteClubMember', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      memberId: t.arg.id(),
      clubId: t.arg.id(),
    },
    authScopes: (_, { clubId }, { user }) =>
      Boolean(
        user?.canEditClubs ||
          user?.clubs.some(({ clubId: id, canEditMembers }) => canEditMembers && clubId === id)
      ),
    async resolve(_, { memberId, clubId }) {
      await prisma.clubMember.delete({
        where: { clubId_memberId: { clubId, memberId } },
      })
      return true
    },
  })
)

/** Updates a club member. */
builder.mutationField('updateClubMember', (t) =>
  t.prismaField({
    type: ClubMemberType,
    args: {
      memberId: t.arg.id(),
      clubId: t.arg.id(),
      title: t.arg.string(),
    },
    authScopes: (_, { clubId }, { user }) =>
      Boolean(
        user?.canEditClubs ||
          user?.clubs.some(({ clubId: id, canEditMembers }) => canEditMembers && clubId === id)
      ),
    resolve: (query, _, { memberId, clubId, title }) =>
      prisma.clubMember.update({
        ...query,
        where: { clubId_memberId: { clubId, memberId } },
        data: { title },
      }),
  })
)
