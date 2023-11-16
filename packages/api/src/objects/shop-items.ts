import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';
import { PaymentMethodEnum } from './registrations.js';
import { prisma } from '../prisma.js';
import { onBoard } from '../auth.js';
import { Visibility } from '@prisma/client';
import { GraphQLError } from 'graphql';

export const ShopItemType = builder.prismaObject('ShopItem', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    price: t.exposeInt('price'),
    stock: t.exposeInt('stock'),
    max: t.exposeInt('max'),
    startsAt: t.expose('startsAt', { type: DateTimeScalar, nullable: true }),
    endsAt: t.expose('endsAt', { type: DateTimeScalar, nullable: true }),
    group: t.relation('group'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    pictures: t.relation('pictures'),
    paymentMethod: t.expose('allowedPaymentMethods', { type: [PaymentMethodEnum] }),
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
          visibility: Visibility.GroupRestricted,
        },
        {
          Visibility: Visibility.SchoolRestricted,
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
          visibility: Visibility.SchoolRestricted,
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

builder.queryField('shopItem', (t) =>
  t.prismaField({
    type: ShopItemType,
    args: {
      itemUid: t.arg.string(),
    },
    async resolve(query, _, { itemUid }, { user }) {
      const item = await prisma.shopItem.findFirst({
        ...query,
        where: {
          id: itemUid,
        },
        include: {
          group: {
            include: {
              members: {
                include: {
                  member: true,
                },
                where: {
                  member: {
                    id: user?.id,
                  },
                },
              },
            },
          },
        },
      });

      if (!item) {
        throw new GraphQLError('Item not found');
      }

      // Switch case
      switch (item.visibility) {
        case Visibility.Public || Visibility.Unlisted:
          return item;
        case Visibility.GroupRestricted:
          if (item.group.members.length) {
            return item;
          }
          throw new GraphQLError('Not allowed to view item');
        case Visibility.Private:
          if (onBoard(item.group.members[0])) {
            return item;
          }
          throw new GraphQLError('Not allowed to view item');
        default:
          throw new GraphQLError('Something went wrong');
      }
    },
  }),
);
