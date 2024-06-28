import { builder, prisma } from '#lib';
import { onBoard } from '#permissions';
import { PaymentMethod as PaymentMethodPrisma, Visibility } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { ShopPaymentType } from '../index.js';

builder.mutationField('upsertShopPayment', (t) =>
  t.prismaField({
    type: ShopPaymentType,
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
      userUid: t.arg.string({ required: true }),
      shopItemId: t.arg.string({ required: true }),
      quantity: t.arg.int({ required: true }),
      paymentMethod: t.arg.string({ required: false }),
      phone: t.arg.string({ required: false }),
      answers: t.arg.stringList({ required: true }),
    },
    async authScopes(_, { shopItemId }, { user }) {
      if (!user) return false;
      if (user.admin) return true;
      const shopItem = await prisma.shopItem.findUniqueOrThrow({
        where: { id: shopItemId },
        include: {
          group: {
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
          },
        },
      });

      switch (shopItem.visibility) {
        case Visibility.Private: {
          if (!onBoard(shopItem.group.members[0])) return false;

          break;
        }

        case Visibility.Public:
        case Visibility.Unlisted: {
          break;
        }

        case Visibility.GroupRestricted: {
          if (shopItem.group.members.length > 0) break;

          return false;
        }

        case Visibility.SchoolRestricted: {
          if (shopItem.group.studentAssociation?.school.uid === user.schoolUid) break;

          return false;
        }

        default: {
          throw new GraphQLError('Something went wrong');
        }
      }

      return true;
    },
    async resolve(
      query,
      _,
      { id, userUid, shopItemId, quantity, paymentMethod, answers },
      { user },
    ) {
      const shopItem = await prisma.shopItem.findUniqueOrThrow({
        where: { id: shopItemId },
        include: {
          group: true,
          lydiaAccount: true,
          shopPayments: {
            where: {
              paid: true,
            },
          },
        },
      });

      if (quantity === 0) throw new GraphQLError("You can't buy 0 of something");

      const stockLeft =
        shopItem.stock === 0
          ? Number.POSITIVE_INFINITY
          : shopItem.stock - shopItem.shopPayments.reduce((acc, curr) => acc + curr.quantity, 0);

      const userLeft =
        shopItem.max -
        shopItem.shopPayments.reduce(
          (acc, curr) => acc + (curr.userId === userUid ? curr.quantity : 0),
          0,
        );

      if (stockLeft < quantity && shopItem.stock != 0) throw new GraphQLError('Not enough stock');
      else if (userLeft < quantity && shopItem.stock != 0)
        throw new GraphQLError('Too much quantity');

      const shopOptions = await prisma.shopItemOption.findMany({
        where: { shopItemId },
        select: {
          options: true,
          required: true,
          otherToggle: true,
        },
      });

      for (const [i, option] of Object.entries(shopOptions)) {
        if (option.required && answers[Number.parseInt(i)] === '')
          throw new GraphQLError('Un champ requis est manquant');

        if (
          !option.otherToggle &&
          !option.options.includes(answers[Number.parseInt(i)] as string)
        ) {
          throw new GraphQLError(
            "Petit malin, tu n'as pas le droit d'inventer ta propre réponse ici",
          );
        }
      }

      if (answers.some((answer) => answer.length > 255)) throw new GraphQLError('Texte trop long');

      const shopPayment = await prisma.shopPayment.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          user: { connect: { uid: userUid } },
          shopItem: { connect: { id: shopItem.id } },
          quantity,
          totalPrice: shopItem.price * quantity,
          paymentMethod: paymentMethod as PaymentMethodPrisma,
          paid: shopItem.price === 0,
        },
        update: {
          user: { connect: { uid: userUid } },
          shopItem: { connect: { id: shopItem.id } },
          quantity,
          totalPrice: shopItem.price * quantity,
          paymentMethod: paymentMethod as PaymentMethodPrisma,
        },
        include: {
          shopItem: {
            include: {
              lydiaAccount: true,
            },
          },
          lydiaTransaction: true,
        },
      });
      await prisma.logEntry.create({
        data: {
          area: 'shop payment',
          action: 'create',
          target: shopPayment.id,
          message: `${shopItem.name} (x${quantity}) for ${userUid}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      await prisma.shopItemAnswer.create({
        data: {
          shopPayment: { connect: { id: shopPayment.id } },
          option: answers,
        },
      });

      return shopPayment;
    },
  }),
);
