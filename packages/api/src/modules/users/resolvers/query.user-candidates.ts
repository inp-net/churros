import { builder, prisma } from '#lib';

import { UserCandidateType } from '../index.js';

builder.queryField('userCandidates', (t) =>
  t.prismaConnection({
    type: UserCandidateType,
    authScopes: { admin: true, studentAssociationAdmin: true },
    cursor: 'id',
    resolve: async (query, _, {}, { user }) => {
      return prisma.userCandidate.findMany({
        ...query,
        where: {
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
        },
      });
    },
  }),
);
