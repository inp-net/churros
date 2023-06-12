import type { LydiaAccount } from '@prisma/client';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';

import { createHash } from 'node:crypto';

export const LydiaAccountType = builder.prismaObject('LydiaAccount', {
  fields: (t) => ({
    id: t.exposeID('groupId'),
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

export function lydiaSignature(
  { privateToken }: { privateToken: string },
  params: Record<string, string>
): string {
  return createHash('md5')
    .update(
      new URLSearchParams(
        Object.keys(params)
          .sort()
          .map((key) => [key, params[key]!])
      ).toString() +
        '&' +
        privateToken
    )
    .digest('hex');
}

builder.mutationField('createLydiaAccount', (t) =>
  t.prismaField({
    type: LydiaAccountType,
    args: {
      group: t.arg.string(),
      name: t.arg.string(),
      privateToken: t.arg.string(),
      vendorToken: t.arg.string(),
    },
    authScopes: (_, { group: groupUid }, { user }) =>
      Boolean(
        user?.admin ||
          user?.groups.some(
            ({ group, president, treasurer }) => group.uid === groupUid && (president || treasurer)
          )
      ),
    resolve: async (query, _, { group, name, privateToken, vendorToken }) =>
      prisma.lydiaAccount.create({
        ...query,
        data: {
          name,
          group: { connect: { uid: group } },
          privateToken,
          vendorToken,
        },
      }),
  })
);

builder.queryField('lydiaAccounts', (t) =>
  t.prismaConnection({
    type: LydiaAccountType,
    cursor: 'id',
    authScopes: (_, {}, { user }) => Boolean(user),
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
  t.prismaConnection({
    type: LydiaAccountType,
    cursor: 'id',
    args: {
      uid: t.arg.string(),
    },
    authScopes: (_, { uid }, { user }) =>
      Boolean(
        user?.admin ||
          user?.groups.some(
            ({ group, president, treasurer }) => group.uid === uid && (president || treasurer)
          )
      ),
    async resolve(query, _, { uid }) {
      return prisma.lydiaAccount.findMany({ ...query, where: { group: { uid } } });
    },
  })
);
