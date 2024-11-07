import { builder, CapacityUnlimitedValue, prisma, subscriptionName } from '#lib';
import { CapacityScalar, eventCapacity, EventType } from '#modules/events';
import { canSeePlacesLeftCount } from '../index.js';

builder.prismaObjectField(EventType, 'placesLeft', (t) =>
  t.field({
    type: CapacityScalar,
    nullable: true,
    subscribe: (subs, { id }) => {
      subs.register(subscriptionName(id));
    },
    async resolve({ id }, _, { user }) {
      const registrations = await prisma.registration.findMany({
        where: { ticket: { event: { id } } },
      });

      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
        include: { ...canSeePlacesLeftCount.prismaIncludes, ...eventCapacity.prismaIncludes },
      });

      let placesLeft = Math.max(
        0,
        eventCapacity(event) - registrations.filter((r) => !r.cancelledAt && !r.opposedAt).length,
      );

      if (placesLeft === Number.POSITIVE_INFINITY) placesLeft = CapacityUnlimitedValue;

      return canSeePlacesLeftCount(event, user, placesLeft) ? placesLeft : null;
    },
  }),
);
