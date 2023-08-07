import type { LydiaAccount } from '@prisma/client';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { checkLydiaAccount } from '../services/lydia.js';
import slug from 'slug';
import { userIsPresidentOf, userIsTreasurerOf } from './groups.js';

export const LydiaAccountType = builder.prismaObject('LydiaAccount', {
  fields: (t) => ({
    id: t.exposeID('id'),
    groupId: t.exposeID('groupId'),
    group: t.relation('group'),
    events: t.relation('events'),
    name: t.exposeString('name'),
    // tokens are NOT EXPOSED, they should never quit the backend
  }),
});

builder.queryField('lydiaAccount', (t) =>
  t.prismaField({
    type: LydiaAccountType,
    args: {
      id: t.arg.id(),
    },
    resolve: async (query, _, { id }) =>
      prisma.lydiaAccount.findFirstOrThrow({ ...query, where: { id } }),
  })
);

builder.mutationField('upsertLydiaAccount', (t) =>
  t.prismaField({
    type: LydiaAccountType,
    args: {
      id: t.arg.id({ required: false }),
      groupUid: t.arg.string(),
      name: t.arg.string(),
      privateToken: t.arg.string(),
      vendorToken: t.arg.string(),
    },
    authScopes: (_, { groupUid }, { user }) =>
      Boolean(
        user?.admin || userIsPresidentOf(user, groupUid) || userIsTreasurerOf(user, groupUid)
      ),
    async resolve(query, _, { id, groupUid, name, privateToken, vendorToken }) {
      await checkLydiaAccount(vendorToken, privateToken);
      const data = {
        uid: slug(name),
        name,
        group: { connect: { uid: groupUid } },
        privateToken,
        vendorToken,
      };
      return prisma.lydiaAccount.upsert({
        ...query,
        create: data,
        update: data,
        where: {
          id: id ?? '',
        },
      });
    },
  })
);

builder.queryField('lydiaAccounts', (t) =>
  t.prismaField({
    type: [LydiaAccountType],
    authScopes: { loggedIn: true },
    async resolve(query, {}, {}) {
      const results = await prisma.lydiaAccount.findMany({ ...query });
      return results.map((result) =>
        Object.fromEntries(
          Object.entries(result).map(([key, value]) => [
            key,
            ['privateToken', 'vendorToken'].includes(key) ? '*****************' : value,
          ])
        )
      ) as LydiaAccount[];
    },
  })
);

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
  })
);
