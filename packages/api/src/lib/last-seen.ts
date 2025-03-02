import { prisma, purgeSessionsUser } from '#lib';
import { differenceInDays } from 'date-fns';

/**
 * Express middleware that updates the last seen date of the logged-in user, in the background (it doesn't wait for the operation to complete)
 */
export function updateUserLastSeen(
  { user }: Express.Request,
  _: Express.Response,
  next: () => void,
) {
  if (!user?.user) return next();

  let needsUpdate = true;

  try {
    // Update users that...
    needsUpdate =
      // Have no lastSeenDate, or
      !user.user.lastSeenAt ||
      // the date is older than 1 day
      Math.abs(differenceInDays(new Date(), user.user.lastSeenAt)) > 1;
  } catch (error) {
    console.error(
      `Error updating last seen date ${user.user.lastSeenAt} for user ${user.user.uid}: ${error}`,
    );
  }

  if (needsUpdate) {
    // Don't wait for the operation to complete
    void (async () => {
      // We need to purge the in-memory sessions for the user, otherwise user.user.lastSeenAt will be outdated on the next requests
      await purgeSessionsUser(user.user.uid);
      await prisma.user.update({
        where: { uid: user.user.uid },
        data: { lastSeenAt: new Date() },
      });
    })();
  }
  return next();
}
