import { CapacityUnlimitedValue, prisma, type Capacity } from '#lib';
import type { EventManagerInvite, Prisma } from '@churros/db/prisma';
import { isPast } from 'date-fns';

export function eventManagerInviteExpirationDate(
  invite: Pick<
    Prisma.EventManagerInviteGetPayload<{ include: { event: true } }>,
    'expiresAt' | 'event'
  >,
) {
  return invite.expiresAt ?? invite.event.endsAt;
}

export function isEventManagerInviteExpired(
  invite: Prisma.EventManagerInviteGetPayload<{ include: { event: true } }>,
) {
  const expiration = eventManagerInviteExpirationDate(invite);
  if (expiration) return isPast(expiration);
  return false;
}

export async function eventManagerInviteUsesLeft(
  invite: Pick<EventManagerInvite, 'id' | 'capacity'>,
): Promise<Capacity> {
  const {
    _count: { usedBy: usesCount },
  } = await prisma.eventManagerInvite.findUniqueOrThrow({
    where: { id: invite.id },
    select: {
      _count: {
        select: {
          usedBy: true,
        },
      },
    },
  });

  return invite.capacity ? Math.max(invite.capacity - usesCount, 0) : CapacityUnlimitedValue;
}

export async function eventManagerInviteHasNoUsesLeft(
  invite: Pick<EventManagerInvite, 'id' | 'capacity'>,
): Promise<boolean> {
  const usesLeft = await eventManagerInviteUsesLeft(invite);
  if (usesLeft === CapacityUnlimitedValue) return false;
  return usesLeft <= 0;
}
