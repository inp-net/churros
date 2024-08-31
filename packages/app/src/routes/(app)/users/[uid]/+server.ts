import { route } from '$lib/ROUTES.js';
import { redirect } from '@sveltejs/kit';

export async function GET({ params }) {
  redirect(301, route('/[uid=uid]', params.uid));
}
