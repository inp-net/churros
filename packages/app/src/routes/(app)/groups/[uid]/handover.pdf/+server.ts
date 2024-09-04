import { env } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';

export async function GET(event) {
  redirect(302, new URL(`/print-handover/${event.params.uid}`, env.PUBLIC_API_URL));
}
