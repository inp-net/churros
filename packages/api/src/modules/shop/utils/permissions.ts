import type { Context } from '#lib';
import { userIsOnBoardOf } from '#permissions';
import { Visibility, type Group, type ShopItem } from '@churros/db/prisma';

export function canAccessShopItem(item: ShopItem & { group: Group }, user: Context['user']) {
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
      return Boolean(user?.major?.schools.some((school) => item.group.schoolId === school.id));
    }

    case Visibility.GroupRestricted: {
      return Boolean(user?.groups.some((s) => s.group.id === item.groupId));
    }
    case Visibility.Private: {
      return userIsOnBoardOf(user, item.group.uid);
    }
  }
}

export function canListShopItem(item: ShopItem & { group: Group }, user: Context['user']) {
  if (user?.admin) return true;
  if (item.visibility === Visibility.Unlisted) return userIsOnBoardOf(user, item.group.uid);
  return canAccessShopItem(item, user);
}
