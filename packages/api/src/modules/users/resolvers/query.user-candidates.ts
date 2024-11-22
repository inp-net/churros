import { builder, prisma, type Context } from '#lib';
import { UserCandidateType } from '../index.js';

builder.queryField('userCandidates', (t) =>
  t.prismaConnection({
    type: UserCandidateType,
    authScopes: { admin: true, studentAssociationAdmin: true },
    cursor: 'id',
    async totalCount(_, {}, { user }) {
      return prisma.userCandidate.count({
        where: whereQuery(user),
      });
    },
    async resolve(query, _, {}, { user }) {
      return prisma.userCandidate.findMany({
        ...query,
        where: whereQuery(user),
      });
    },
  }),
);

const whereQuery = (user: Context['user']) => ({
  emailValidated: true,
  ...(user?.admin
    ? {}
    : // only return signups for the student association the user is admin of
      {
        major: {
          schools: {
            some: { studentAssociations: { some: { admins: { some: { id: user?.id } } } } },
          },
        },
      }),
});
