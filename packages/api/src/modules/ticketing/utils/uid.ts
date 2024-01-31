import { prisma } from '#lib';
import dichotomid from 'dichotomid';
import slug from 'slug';

export async function createTicketUid({
  name,
  eventId,
  ticketGroupId,
  ticketGroupName,
}: {
  name: string;
  eventId: string;
  ticketGroupId: null | undefined | string;
  ticketGroupName: null | undefined | string;
}) {
  const base = ticketGroupName ? `${slug(ticketGroupName)}--${slug(name)}` : slug(name);
  const n = await dichotomid(
    async (n) =>
      !(await prisma.ticket.findFirst({
        where: {
          eventId,
          ticketGroupId,
          name: `${base}${n > 1 ? `-${n}` : ''}`,
        },
      })),
  );
  return `${base}${n > 1 ? `-${n}` : ''}`;
}
