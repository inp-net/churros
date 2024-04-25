import type { Context } from '#lib';
import type { Event, EventManager } from '@prisma/client';

export function canScanBookings(
  event: Event & { managers: EventManager[] },
  user: Context['user'],
) {
  if (user?.admin) return true;

  const membership = user?.groups.find(({ group }) => group.id === event.groupId);
  if (membership?.canScanEvents) return true;

  const managementship = event.managers.find((m) => m.userId === user?.id);
  if (managementship?.canVerifyRegistrations) return true;

  return false;
}
