import { builder, prisma } from '#lib';
import { onBoard } from '#permissions';
import { Visibility } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { ShopItemType } from '../index.js';

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
