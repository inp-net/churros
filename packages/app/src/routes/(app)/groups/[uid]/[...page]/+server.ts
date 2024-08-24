import { route } from '$lib/ROUTES';
import { redirect } from '@sveltejs/kit';

export async function GET({ params: { uid, page } }) {
  redirect(301, route('/[uid=uid]/[...page]', { uid, page: page.split('/') }));
}
