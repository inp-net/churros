import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) =>
  locals.token
    ? { token: locals.token, me: locals.me, mobile: locals.mobile }
    : { mobile: locals.mobile };

export const trailingSlash = 'always';
