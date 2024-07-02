import { builder, prisma } from '#lib';
import { userIsOnBoardOf } from '#permissions';
import { Visibility } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { ShopItemType } from '../index.js';

builder.queryField('shopItem', (t) =>
  t.prismaField({
    type: ShopItemType,
    args: {
      slug: t.arg.string(),
    },
    async resolve(query, _, { slug }, { user }) {
      const item = await prisma.shopItem.findFirst({
        ...query,
        where: { slug },
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
      if (user?.admin) return item;
      if (userIsOnBoardOf(user, item.group.uid)) return item;
      // Switch case
      switch (item.visibility) {
        case Visibility.Private: {
          if (userIsOnBoardOf(user, item.group.uid)) return item;

          throw new GraphQLError('Not allowed to view item');
        }

        case Visibility.Public: {
          return item;
        }

        case Visibility.Unlisted: {
          return item;
        }

        case Visibility.SchoolRestricted: {
          if (user?.major?.schools.some((school) => item.group.schoolId === school.id)) return item;
          throw new GraphQLError('Not allowed to view item');
        }
        case Visibility.GroupRestricted: {
          if (user?.groups.some((s) => s.group.id === item.groupId)) return item;

          throw new GraphQLError('Not allowed to view item');
        }

        default: {
          throw new GraphQLError('Something went wrong');
        }
      }
    },
  }),
);
