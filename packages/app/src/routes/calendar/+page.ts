import { redirect } from '@sveltejs/kit';

export const load = () => {
  const now = new Date();
  throw redirect(307, `${now.getFullYear()}/${`${now.getMonth() + 1}`.padStart(2, '0')}/`);
};
