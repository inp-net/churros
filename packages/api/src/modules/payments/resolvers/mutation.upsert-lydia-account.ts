import { builder, log, prisma } from '#lib';
import { canEditLydiaAccounts } from '#modules/groups';
import { LydiaAccountType, checkLydiaAccount } from '../index.js';

builder.mutationField('upsertLydiaAccount', (t) =>
  t.prismaField({
    type: LydiaAccountType,
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
      groupUid: t.arg.string(),
      name: t.arg.string(),
      privateToken: t.arg.string(),
      vendorToken: t.arg.string(),
    },
    async authScopes(_, { groupUid }, { user }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
        include: canEditLydiaAccounts.prismaIncludes,
      });
      return canEditLydiaAccounts(user, group);
    },
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
      await log(
        'lydiaAccounts',
        id ? 'update' : 'create',
        { message: `Lydia account ${id ? 'updated' : 'created'}: ${name}` },
        lydiaAccount.id,
        user,
      );
      return lydiaAccount;
    },
  }),
);
