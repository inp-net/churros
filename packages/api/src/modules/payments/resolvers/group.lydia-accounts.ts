import { builder, prisma } from '#lib';
import { GroupType } from '#modules/groups';
import { LydiaAccountType } from '../index.js';

builder.prismaObjectField(GroupType, 'lydiaAccounts', (t) =>
  t.prismaField({
    type: [LydiaAccountType],
    async resolve(query, { uid }) {
      return prisma.lydiaAccount.findMany({ ...query, where: { group: { uid } } });
    },
  }),
);
