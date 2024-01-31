import { builder, prisma } from '#lib';

import type { LydiaAccount } from '@prisma/client';
import { LydiaAccountType } from '../index.js';
// TODO remove, getting _all_ lydia accounts is useless
builder.queryField('lydiaAccounts', (t) =>
  t.prismaField({
    type: [LydiaAccountType],
    authScopes: { loggedIn: true },
    async resolve(query, _, {}) {
      const results = await prisma.lydiaAccount.findMany({ ...query });
      return results.map((result) =>
        Object.fromEntries(
          Object.entries(result).map(([key, value]) => [
            key,
            ['privateToken', 'vendorToken'].includes(key) ? '*****************' : value,
          ]),
        ),
      ) as LydiaAccount[];
    },
  }),
);
