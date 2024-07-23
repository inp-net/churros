import { builder, prisma } from '#lib';
import { GroupType } from '#modules/groups';
import { LydiaAccountType } from '#modules/payments/types';

builder.prismaObjectField(GroupType, 'lydiaAccounts', (t) =>
  t.prismaField({
    type: [LydiaAccountType],
    description: 'Comptes Lydia du groupe',
    resolve: (query, { id }) => prisma.lydiaAccount.findMany({ ...query, where: { groupId: id } }),
  }),
);
