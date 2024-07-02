import { builder, type Context } from '#lib';
import { canEdit, EventType } from '#modules/events';
import { canScanBookings } from '#modules/ticketing/utils';
import type { EventManager, Group, Event } from '@churros/db/prisma';

export function canSeeBookings(
  event: Event & {
    managers: EventManager[];
    group: Group;
  },
  user: Context['user'],
) {
  return canScanBookings(event, user) || canEdit(event, user);
}

builder.prismaObjectField(EventType, 'canSeeBookings', (t) =>
  t.boolean({
    description: "L'utilisateur·ice connecté·e peut scanner les réservations de cet évènement",
    resolve: (event, _, { user }) => canScanBookings(event, user),
  }),
);
