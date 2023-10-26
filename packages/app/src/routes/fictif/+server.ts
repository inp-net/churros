import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
  throw redirect(307, 'https://git.inpt.fr/inp-net/churros/-/issues/647');
};
