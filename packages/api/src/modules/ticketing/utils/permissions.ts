import type { Context } from '#lib';
import { userIsAdminOf } from '#permissions';
import type { Event, EventManager, Group } from '@churros/db/prisma';

export function canScanBookings(
  event: Event & { managers: EventManager[]; group: Group },
  user: Context['user'],
) {
  if (userIsAdminOf(user, event.group.studentAssociationId)) return true;

  const membership = user?.groups.find(({ group }) => group.id === event.groupId);
  if (membership?.canScanEvents) return true;

  const managementship = event.managers.find((m) => m.userId === user?.id);
  return !!managementship?.canVerifyRegistrations;
}
