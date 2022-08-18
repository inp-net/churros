import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  if (!locals.token) return { mobile: locals.mobile };
  return { token: locals.token, me: locals.me, mobile: locals.mobile };
};
