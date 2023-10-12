import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';
import { PaymentMethodEnum } from './registrations.js';
import { prisma } from '../prisma.js';
import { onBoard } from '../auth.js';
import { Visibility } from '@prisma/client';

export const ShopItemType = builder.prismaObject('ShopItem', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    price: t.exposeInt('price'),
    quantity: t.exposeInt('quantity'),
    startsAt: t.expose('startsAt', { type: DateTimeScalar, nullable: true }),
    endsAt: t.expose('endsAt', { type: DateTimeScalar, nullable: true }),
    group: t.relation('group'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    pictures: t.relation('pictures'),
    paymentMethod: t.expose('allowedPaymentMethods', { type: [PaymentMethodEnum], nullable: true }),
  }),
});

export async function visibleShopPrismaQuery(groupUid: string, user: { id: string }) {
  const group = await prisma.group.findFirst({
    where: {
      uid: groupUid,
    },
    include: {
      members: {
        include: {
          member: true,
        },
        where: {
          member: {
            id: user.id,
          },
        },
      },
    },
  });
  // If user is part of the board set visibility to board visibility
  if (onBoard(group?.members[0])) {
    return {
      OR: [
        {
          visibility: Visibility.Public,
        },
        {
          visibility: Visibility.Private,
        },
        {
          visibility: Visibility.Restricted,
        },
        {
          visibility: Visibility.Unlisted,
        },
      ],
    };
  } else if (group?.members.length) {
    return {
      OR: [
        {
          visibility: Visibility.Public,
        },
        {
          visibility: Visibility.Restricted,
        },
      ],
    };
  }
  return {
    visibility: Visibility.Public,
  };
}

builder.queryField('shopItems', (t) =>
  t.prismaField({
    type: [ShopItemType],
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    args: {
      groupUid: t.arg.string(),
    },
    async resolve(query, _, { groupUid }, { user }) {
      let visibility: any = {
        visibility: Visibility.Public,
      };
      if (user) {
        visibility = await visibleShopPrismaQuery(groupUid, user);
      }

      return prisma.shopItem.findMany({
        ...query,
        where: {
          ...visibility,
          group: {
            uid: groupUid,
          },
        },
      });
    },
  }),
);
