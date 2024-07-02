import { prisma } from '#lib';
import dichotomid from 'dichotomid';
import slug from 'slug';

export async function createUid({ title, groupId }: { title: string; groupId: string }) {
  const base = slug(title);
  const n = await dichotomid(
    async (n) =>
      !(await prisma.event.findUnique({
        where: { groupId_slug: { groupId, slug: `${base}${n > 1 ? `-${n}` : ''}` } },
      })),
  );
  return `${base}${n > 1 ? `-${n}` : ''}`;
}

//TODO move to ticketing module once mutation upsertEvent has been split
export async function createTicketUid({
  name,
  eventId,
  ticketGroupName,
}: {
  name: string;
  eventId: string;
  ticketGroupName: null | undefined | string;
}) {
  const base = ticketGroupName ? `${slug(ticketGroupName)}--${slug(name)}` : slug(name);
  const n = await dichotomid(
    async (n) =>
      !(await prisma.ticket.findFirst({
        where: { eventId, name: `${base}${n > 1 ? `-${n}` : ''}` },
      })),
  );
  return `${base}${n > 1 ? `-${n}` : ''}`;
}
