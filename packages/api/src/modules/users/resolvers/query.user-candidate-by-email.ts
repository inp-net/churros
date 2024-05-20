import { builder, prisma } from '#lib';

import { UserCandidateType } from '../index.js';
// TODO merge with query.user-candidate

builder.queryField('userCandidateByEmail', (t) =>
  t.prismaField({
    type: UserCandidateType,
    authScopes: { admin: true, studentAssociationAdmin: true },
    args: { email: t.arg.string() },
    resolve: async (query, _, { email }, { user }) =>
      prisma.userCandidate.findUniqueOrThrow({
        ...query,
        where: {
          email,
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
      }),
  }),
);
