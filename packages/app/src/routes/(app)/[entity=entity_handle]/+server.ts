import { route } from '$lib/ROUTES';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
  const uid = event.params.entity!.replace('@', '');
  throw redirect(302, route('/[uid=uid]', uid));
};
