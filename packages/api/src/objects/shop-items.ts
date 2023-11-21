import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';
import { PaymentMethodEnum } from './registrations.js';
import { prisma } from '../prisma.js';
import { onBoard } from '../auth.js';
import { Visibility } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { VisibilityEnum } from './events.js';

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
    paymentMethods: t.expose('allowedPaymentMethods', { type: [PaymentMethodEnum] }),
    visibility: t.expose('visibility', { type: VisibilityEnum }),
    lydiaAccount: t.relation('lydiaAccount'),
    stockLeft: t.field({
      type: 'Int',
      async resolve({ id }) {
        const item = await prisma.shopItem.findUnique({
          where: { id },
          include: { shopPayments: { where: { paid: true } } },
        });
        if (!item) throw new GraphQLError('Item not found');

        const sold = item.shopPayments.reduce((acc, payment) => acc + payment.quantity, 0);
        return item.stock - sold;
      },
    }),
  }),
});

interface VisibilityQuery {
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

builder.queryField('shopItems', (t) =>
  t.prismaField({
    type: [ShopItemType],
    args: {
      groupUid: t.arg.string(),
    },
    async resolve(query, _, { groupUid }, { user }) {
      let visibility: VisibilityQuery = {
        visibility: Visibility.Public,
      };
      if (user) visibility = await visibleShopPrismaQuery(groupUid, user);

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

      if (!item) throw new GraphQLError('Item not found');

      // Switch case
      switch (item.visibility) {
        case Visibility.Public:
        case Visibility.Unlisted: {
          return item;
        }

        case Visibility.GroupRestricted: {
          if (item.group.members.length > 0) return item;

          throw new GraphQLError('Not allowed to view item');
        }

        case Visibility.Private: {
          if (onBoard(item.group.members[0])) return item;

          throw new GraphQLError('Not allowed to view item');
        }

        default: {
          throw new GraphQLError('Something went wrong');
        }
      }
    },
  }),
);

builder.mutationField('upsertShopItem', (t) =>
  t.prismaField({
    type: ShopItemType,
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
      name: t.arg.string(),
      price: t.arg.int(),
      stock: t.arg.int(),
      max: t.arg.int(),
      description: t.arg.string(),
      paymentMethods: t.arg({ type: [PaymentMethodEnum] }),
      startsAt: t.arg({ type: DateTimeScalar, required: false }),
      endsAt: t.arg({ type: DateTimeScalar, required: false }),
      groupUid: t.arg.string(),
      visibility: t.arg({ type: VisibilityEnum }),
      lydiaAccounId: t.arg.string(),
    },

    async authScopes(_, { groupUid }, { user }) {
      if (!user) return false;

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

      if (!group) return false;

      if (!onBoard(group.members[0])) return false;

      return true;
    },
    async resolve(
      query,
      _,
      {
        id,
        name,
        price,
        stock,
        max,
        description,
        startsAt,
        endsAt,
        groupUid,
        visibility,
        lydiaAccounId,
        paymentMethods,
      },
      { user },
    ) {
      const shopItem = await prisma.shopItem.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          name,
          price,
          stock,
          max,
          description,
          startsAt,
          endsAt,
          group: { connect: { uid: groupUid } },
          lydiaAccount: { connect: { id: lydiaAccounId } },
          allowedPaymentMethods: {
            set: paymentMethods || [],
          },
          visibility,
        },
        update: {
          name,
          price,
          stock,
          max,
          description,
          startsAt,
          endsAt,
          group: { connect: { uid: groupUid } },
          lydiaAccount: { connect: { id: lydiaAccounId } },
          allowedPaymentMethods: {
            set: paymentMethods || [],
          },
          visibility,
        },
      });

      await prisma.logEntry.create({
        data: {
          area: 'shop',
          action: id ? 'update' : 'create',
          target: shopItem.id,
          message: `Service ${shopItem.id} created: ${shopItem.name}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });

      return shopItem;
    },
  }),
);
