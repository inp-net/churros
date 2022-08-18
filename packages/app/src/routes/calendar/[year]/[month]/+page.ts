import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const monthToPath = (date: Date) =>
  `${date.getFullYear()}/${`${date.getMonth() + 1}`.padStart(2, '0')}/`;

export const load: PageLoad = ({ params, url }) => {
  const firstDay = new Date(Number(params.year), Number(params.month) - 1, 1);
  const path = monthToPath(firstDay);
  if (!url.pathname.endsWith(path)) throw redirect(307, `../../${path}`);
  return { firstDay };
};
