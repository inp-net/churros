import { redirect } from '@sveltejs/kit';

export async function GET({ params }) {
  redirect(307, `/events/${params.monday}`);
}
