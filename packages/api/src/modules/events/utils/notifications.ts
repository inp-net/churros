import { localID, prisma } from '#lib';
import { clearScheduledNotifications, queueNotification } from '#modules/notifications';
import { Event as NotellaEvent } from '@inp-net/notella';
import { format, subMinutes } from 'date-fns';

export async function scheduleShotgunNotifications(eventId: string): Promise<void> {
  const { tickets, title, id } = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: { tickets: true },
  });

  if (tickets.length === 0) return;
  const soonDate = (date: Date) => subMinutes(date, 10);

  const opensAt = new Date(
    Math.min(...tickets.map(({ opensAt }) => opensAt?.valueOf() ?? Number.POSITIVE_INFINITY)),
  );

  const closesAt = new Date(
    Math.min(...tickets.map(({ closesAt }) => closesAt?.valueOf() ?? Number.POSITIVE_INFINITY)),
  );

  await clearScheduledNotifications(id);

  await queueNotification({
    title: `Shotgun pour ${title}`,
    body: `Prépare-toi, il ouvre à ${format(opensAt, 'HH:mm')}`,
    send_at: soonDate(opensAt),
    object_id: id,
    action: `/events/${localID(id)}`,
    event: NotellaEvent.ShotgunOpensSoon,
    eager: false,
  });

  await queueNotification({
    title: `Shotgun pour ${title}`,
    body: `Attention, il ferme à ${format(closesAt, 'HH:mm')}, dépeches-toi !`,
    send_at: soonDate(closesAt),
    object_id: id,
    action: `/events/${localID(id)}`,
    event: NotellaEvent.ShotgunClosesSoon,
    eager: false,
  });
}
