import { Visibility, type Prisma } from '@churros/db/prisma';

/**
 *
 * @param event the event to check
 * @returns [allowed visibilities, message explaining why some visibilities are not allowed]
 */
export function allowedVisibilities(
  event: Prisma.EventGetPayload<{
    include: { tickets: true };
  }>,
): [Visibility[], string] {
  if (!event.startsAt || !event.endsAt) {
    return [
      [Visibility.Private, Visibility.Unlisted],
      "L'évènement n'a pas de date de début et de fin",
    ];
  }

  if (event.tickets.some((t) => t.openToExternal !== false)) {
    return [
      [Visibility.Private, Visibility.Unlisted, Visibility.Public],
      "L'évènement a des billets ouverts aux externes",
    ];
  }

  return [Object.values(Visibility), ''];
}
