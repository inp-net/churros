import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { formatISO, isMonday, previousMonday } from 'date-fns';

function closestMonday(date: Date) {
  if (isMonday(date)) return date;
  return previousMonday(date);
}

export const GET: RequestHandler = () => {
  throw redirect(
    301,
    `/events/week/${formatISO(closestMonday(new Date()), {
      representation: 'date',
    })}`
  );
};
