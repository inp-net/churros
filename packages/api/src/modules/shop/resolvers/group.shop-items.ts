import { builder, prisma } from '#lib';
import { userIsOnBoardOf } from '#permissions';
import { Visibility } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { ShopItemType } from '../index.js';
import { GroupType } from '#modules/groups';

builder.prismaObjectField(GroupType, 'shopItems', (t) =>
  t.prismaConnection({
    type: ShopItemType,
    cursor: 'id',
    async resolve(query, { id: groupId }, _, { user }) {
      const items = await prisma.shopItem.findMany({
        ...query,
        where: { groupId },
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
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!items) throw new GraphQLError('No item found');
      if (user?.admin) return items;
      const itemsToReturn = [];
      for (const item of items) {
        if (userIsOnBoardOf(user, item.group.uid)) return items;
        switch (item.visibility) {
          case Visibility.Public: {
            itemsToReturn.push(item);
            break;
          }
          case Visibility.Unlisted: {
            break;
          }

          case Visibility.SchoolRestricted: {
            if (user?.major?.schools.some((school) => item.group.schoolId === school.id))
              itemsToReturn.push(item);
            break;
          }

          case Visibility.GroupRestricted: {
            if (user?.groups.some((s) => s.group.id === item.groupId)) itemsToReturn.push(item);
            break;
          }
          case Visibility.Private: {
            if (userIsOnBoardOf(user, item.group.uid)) itemsToReturn.push(item);
            break;
          }

          default: {
            //items.splice(items.indexOf(item), 1);
            throw new GraphQLError('Something went wrong');
          }
        }
      }
      return itemsToReturn;
    },
  }),
);
