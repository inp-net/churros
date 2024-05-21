import { env } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params: { uid } }) => {
  throw redirect(302, new URL(`/print-handover/${uid}`, env.PUBLIC_API_URL));
};
