import { localID, prisma } from '#lib';
import { clearScheduledNotifications, queueNotification } from '#modules/notifications';
import { Event as NotellaEvent } from '@inp-net/notella';
import { subMinutes } from 'date-fns';

const SOON_MINUTES = 10;

export async function scheduleShotgunNotifications(eventId: string): Promise<void> {
  const { tickets, title, id } = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: { tickets: true },
  });

  if (tickets.length === 0) return;
  const soonDate = (date: Date) => subMinutes(date, SOON_MINUTES);

  const opensAt = new Date(
    Math.min(...tickets.map(({ opensAt }) => opensAt?.valueOf() ?? Number.POSITIVE_INFINITY)),
  );

  const closesAt = new Date(
    Math.min(...tickets.map(({ closesAt }) => closesAt?.valueOf() ?? Number.POSITIVE_INFINITY)),
  );

  await clearScheduledNotifications(id);

  await queueNotification({
    title: `Shotgun pour ${title}`,
    // TODO: store user's timezone and format the date accordingly
    // body: `Prépare-toi, il ouvre à ${format(opensAt, 'HH:mm')}`,
    body: `Prépare-toi, il ouvre à dans ${SOON_MINUTES} minutes`,
    send_at: soonDate(opensAt),
    object_id: id,
    action: `/events/${localID(id)}`,
    event: NotellaEvent.ShotgunOpensSoon,
    eager: false,
  });

  await queueNotification({
    title: `Shotgun pour ${title}`,
    body: `Attention, il ferme dans ${SOON_MINUTES} minutes, dépeches-toi !`,
    send_at: soonDate(closesAt),
    object_id: id,
    action: `/events/${localID(id)}`,
    event: NotellaEvent.ShotgunClosesSoon,
    eager: false,
  });
}
