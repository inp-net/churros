import type { Context } from '#lib';
import { userIsOnBoardOf } from '#permissions';

export function canManageThirdPartyApp(
  app: { groupId: string; group: { uid: string } },
  user: Context['user'],
) {
  return Boolean(
    user?.admin ||
      userIsOnBoardOf(user, app.group.uid) ||
      user?.groups.some((g) => g.group.id === app.groupId && g.isDeveloper),
  );
}
