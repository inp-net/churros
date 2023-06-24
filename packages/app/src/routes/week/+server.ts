import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { formatISO, isMonday, previousMonday } from 'date-fns';

function closestMonday(date: Date) {
  if (isMonday(date)) return date;
  return previousMonday(date);
}

export const GET: RequestHandler = () => {
  console.log(
    `Redirecting to /week/${formatISO(closestMonday(new Date()), {
      representation: 'date',
    })}`
  );
  throw redirect(
    301,
    `/week/${formatISO(closestMonday(new Date()), {
      representation: 'date',
    })}`
  );
};
