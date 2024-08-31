import { env } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params: { pseudoID } }) => {
  throw redirect(302, new URL(`/print-booking/${pseudoID}`, env.PUBLIC_API_URL));
};
