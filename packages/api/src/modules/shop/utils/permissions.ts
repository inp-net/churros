import type { Context } from '#lib';
import { userIsOnBoardOf } from '#permissions';
import { Visibility, type Group, type ShopItem } from '@churros/db/prisma';

export function canAccessShopItem(
  user: Context['user'],
  item: ShopItem & { group: Group & { studentAssociation: { schoolId: string } } },
): boolean {
  if (user?.admin) return true;
  if (userIsOnBoardOf(user, item.group.uid)) return true;
  switch (item.visibility) {
    case Visibility.Public: {
      return true;
    }
    case Visibility.Unlisted: {
      return true;
    }

    case Visibility.SchoolRestricted: {
      return Boolean(
        user?.major?.schools.some((school) => item.group.studentAssociation.schoolId === school.id),
      );
    }

    case Visibility.GroupRestricted: {
      return Boolean(user?.groups.some((s) => s.group.id === item.groupId));
    }
    case Visibility.Private: {
      return Boolean(userIsOnBoardOf(user, item.group.uid));
    }

    default: {
      return false;
    }
  }
}

export function canListShopItem(
  user: Context['user'],
  item: ShopItem & { group: Group & { studentAssociation: { schoolId: string } } },
): boolean {
  if (userIsOnBoardOf(user, item.group.uid)) return true;
  return item.visibility !== Visibility.Unlisted && canAccessShopItem(user, item);
}
