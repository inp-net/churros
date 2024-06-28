import { builder, prisma, toHtml } from '#lib';
import { DateTimeScalar, VisibilityEnum } from '#modules/global';
import { PaymentMethodEnum } from '#modules/payments';
import { onBoard } from '#permissions';
import { Visibility } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';

export const ShopItemType = builder.prismaObject('ShopItem', {
  fields: (t) => ({
    id: t.exposeID('id'),
    uid: t.exposeString('uid'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    descriptionHtml: t.string({
      resolve: async ({ description }) => toHtml(description),
    }),
    price: t.exposeFloat('price'),
    stock: t.exposeInt('stock'),
    max: t.exposeInt('max'),
    startsAt: t.expose('startsAt', { type: DateTimeScalar, nullable: true }),
    endsAt: t.expose('endsAt', { type: DateTimeScalar, nullable: true }),
    group: t.relation('group'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    pictures: t.relation('pictures'),
    shopPayments: t.relation('shopPayments'),
    paymentMethods: t.expose('allowedPaymentMethods', { type: [PaymentMethodEnum] }),
    visibility: t.expose('visibility', { type: VisibilityEnum }),
    lydiaAccount: t.relation('lydiaAccount', { nullable: true }),
    stockLeft: t.field({
      type: 'Int',
      async resolve({ id }) {
        const item = await prisma.shopItem.findUnique({
          where: { id },
          include: { shopPayments: { where: { paid: true } } },
        });
        if (!item) throw new GraphQLError('Item not found');

        const stockLeft =
          item.stock === 0
            ? -1
            : item.stock - item.shopPayments.reduce((acc, payment) => acc + payment.quantity, 0);

        return stockLeft;
      },
    }),
    itemOptions: t.relation('itemOptions'),
  }),
});

export interface VisibilityQuery {
  OR?: Array<{
    visibility: Visibility;
  }>;
  visibility?: Visibility;
}

export async function visibleShopPrismaQuery(
  groupUid: string,
  user: { id: string; schoolUid: string | null },
) {
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
      studentAssociation: {
        include: {
          school: true,
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
          visibility: Visibility.SchoolRestricted,
        },
        {
          visibility: Visibility.Unlisted,
        },
      ],
    };
  }

  if (group?.members.length) {
    return {
      OR: [
        {
          visibility: Visibility.Public,
        },
        {
          visibility: Visibility.GroupRestricted,
        },
        {
          visibility: Visibility.SchoolRestricted,
        },
      ],
    };
  }

  if (group?.studentAssociation?.school?.uid === user.schoolUid) {
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
