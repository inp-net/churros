import { redirect } from '@sveltejs/kit';
import { formatISO, isMonday, previousMonday } from 'date-fns';
import type { RequestHandler } from './$types';

function closestMonday(date: Date) {
  if (isMonday(date)) return date;
  return previousMonday(date);
}

export const GET: RequestHandler = () => {
  throw redirect(
    302,
    `/events/week/${formatISO(closestMonday(new Date()), {
      representation: 'date',
    })}`,
  );
};
