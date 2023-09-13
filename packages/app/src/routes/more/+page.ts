// Redirect to services page

import { redirect } from '@sveltejs/kit';

export const load = () => {
  throw redirect(301, '/services');
};
