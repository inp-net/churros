import { redirectToLogin } from '$lib/session';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ locals }) => {
  if (locals.me) throw redirect(307, `/users/${locals.me.uid}`);
  throw redirectToLogin(`/me`);
};
