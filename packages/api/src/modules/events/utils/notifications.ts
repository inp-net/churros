import { localID } from '#lib';
import { queueNotification } from '#modules/notifications';
import { type Ticket } from '@churros/db/prisma';
import { Event as NotellaEvent } from '@inp-net/notella';
import { format, subMinutes } from 'date-fns';

export async function scheduleShotgunNotifications({
  id,
  tickets,
  notifiedAt,
  title,
}: {
  id: string;
  tickets: Ticket[];
  notifiedAt: Date | null;
  title: string;
}): Promise<void> {
  if (tickets.length === 0) return;
  if (notifiedAt) return;
  const soonDate = (date: Date) => subMinutes(date, 10);

  const opensAt = new Date(
    Math.min(...tickets.map(({ opensAt }) => opensAt?.valueOf() ?? Number.POSITIVE_INFINITY)),
  );

  const closesAt = new Date(
    Math.min(...tickets.map(({ closesAt }) => closesAt?.valueOf() ?? Number.POSITIVE_INFINITY)),
  );

  await queueNotification({
    title: `Shotgun pour ${title}`,
    body: `Prépare-toi, il ouvre à ${format(opensAt, 'HH:mm')}`,
    send_at: soonDate(opensAt),
    object_id: id,
    action: `/events/${localID(id)}`,
    event: NotellaEvent.ShotgunOpensSoon,
  });

  await queueNotification({
    title: `Shotgun pour ${title}`,
    body: `Attention, il ferme à ${format(closesAt, 'HH:mm')}, dépeches-toi !`,
    send_at: soonDate(closesAt),
    object_id: id,
    action: `/events/${localID(id)}`,
    event: NotellaEvent.ShotgunClosesSoon,
  });
}
