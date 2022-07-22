import { builder } from '../builder.js';
import { prisma } from '../prisma.js';

/** Represents a club, mapped on the underlying database object. */
export const ClubType = builder.prismaObject('Club', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    articles: t.relation('articles', {
      query: { orderBy: { publishedAt: 'desc' } },
    }),
    members: t.relation('members', {
      // Seeing group members requires being logged in
      authScopes: { loggedIn: true },
      query: {
        orderBy: [
          { president: 'desc' },
          { treasurer: 'desc' },
          { member: { firstname: 'asc' } },
          { member: { lastname: 'asc' } },
        ],
      },
    }),
    school: t.relation('school'),
  }),
});

/** List clubs. */
builder.queryField('clubs', (t) =>
  t.prismaField({
    type: [ClubType],
    resolve: (query) => prisma.club.findMany({ ...query, orderBy: { name: 'asc' } }),
  })
);

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
);

/** Updates a club. */
builder.mutationField('updateClub', (t) =>
  t.prismaField({
    type: ClubType,
    args: { id: t.arg.id(), name: t.arg.string() },
    authScopes: (_, { id }, { user }) =>
      Boolean(
        user?.canEditClubs ||
          user?.clubs.some(({ clubId, president }) => president && clubId === id)
      ),
    resolve: async (query, _, { id, name }) =>
      prisma.club.update({
        ...query,
        where: { id },
        data: { name },
      }),
  })
);

/** Deletes a club. */
builder.mutationField('deleteClub', (t) =>
  t.field({
    type: 'Boolean',
    args: { id: t.arg.id() },
    authScopes: (_, { id }, { user }) =>
      Boolean(
        user?.canEditClubs ||
          user?.clubs.some(({ clubId, president }) => president && clubId === id)
      ),
    async resolve(_, { id }) {
      await prisma.club.delete({ where: { id } });
      return true;
    },
  })
);
