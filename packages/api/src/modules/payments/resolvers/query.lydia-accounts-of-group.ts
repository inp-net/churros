import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { LydiaAccountType } from '../index.js';
// TODO rename to group.lydia-accounts

builder.queryField('lydiaAccountsOfGroup', (t) =>
  t.prismaField({
    type: [LydiaAccountType],
    args: {
      uid: t.arg.string(),
    },
    // authScopes: (_, { uid }, { user }) =>
    //   Boolean(user?.admin || userIsPresidentOf(user, uid) || userIsTreasurerOf(user, uid)),
    async resolve(query, _, { uid }) {
      return prisma.lydiaAccount.findMany({ ...query, where: { group: { uid } } });
    },
  }),
);
