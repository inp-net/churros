import { MyUidStore } from '$houdini';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const { data } = await new MyUidStore().fetch({ event });
  if (data?.me?.uid) redirect(302, `/users/${data.me.uid}`);
  redirect(302, '/login');
};
