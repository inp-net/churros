import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
  throw redirect(301, 'https://www.youtube.com/watch?v=6QLMPZzBnNE');
};
