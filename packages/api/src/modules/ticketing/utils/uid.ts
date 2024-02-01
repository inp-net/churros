import { prisma } from '#lib';
import dichotomid from 'dichotomid';
import slug from 'slug';

export async function createTicketUid({ name, eventId }: { name: string; eventId: string }) {
  const base = slug(name);
  const n = await dichotomid(
    async (n) =>
      !(await prisma.ticket.findFirst({
        where: {
          eventId,
          name: `${base}${n > 1 ? `-${n}` : ''}`,
        },
      })),
  );
  return `${base}${n > 1 ? `-${n}` : ''}`;
}
