import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const dayToPath = (date: Date) =>
  `${date.getFullYear()}/` +
  `${`${date.getMonth() + 1}`.padStart(2, '0')}/` +
  `${`${date.getDate()}`.padStart(2, '0')}/`;

export const load: PageLoad = ({ params, url }) => {
  const day = new Date(Number(params.year), Number(params.month) - 1, Number(params.day));
  const path = dayToPath(day);
  if (!url.pathname.endsWith(path)) throw redirect(307, `../../../${path}`);
  return { day };
};
