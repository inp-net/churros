import { builder, prisma } from '#lib';
import { DateTimeScalar, VisibilityEnum } from '#modules/global';
import { PaymentMethodEnum } from '#modules/payments';
import { onBoard } from '#permissions';
import { ShopItemType } from '../index.js';

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
      lydiaAccounId: t.arg.string({ required: false }),
    },

    async authScopes(_, { groupUid }, { user }) {
      if (!user) return false;
      if (user.admin) return true;

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
          lydiaAccount: lydiaAccounId ? { connect: { id: lydiaAccounId } } : undefined,
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
          lydiaAccount: lydiaAccounId ? { connect: { id: lydiaAccounId } } : { disconnect: true },
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
