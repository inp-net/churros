import { builder, prisma } from '#lib';

import { userIsPresidentOf, userIsTreasurerOf } from '#permissions';
import { LydiaAccountType, checkLydiaAccount } from '../index.js';

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
        user?.admin || userIsPresidentOf(user, groupUid) || userIsTreasurerOf(user, groupUid),
      ),
    async resolve(query, _, { id, groupUid, name, privateToken, vendorToken }, { user }) {
      await checkLydiaAccount(vendorToken, privateToken);
      const data = {
        name,
        group: { connect: { uid: groupUid } },
        privateToken,
        vendorToken,
      };
      const lydiaAccount = await prisma.lydiaAccount.upsert({
        ...query,
        create: data,
        update: data,
        where: {
          id: id ?? '',
        },
      });
      await prisma.logEntry.create({
        data: {
          area: 'lydiaAccounts',
          action: id ? 'update' : 'create',
          target: lydiaAccount.id,
          message: `Lydia account ${id ? 'updated' : 'created'}: ${name}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return lydiaAccount;
    },
  }),
);
