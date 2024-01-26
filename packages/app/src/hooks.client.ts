import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, event: { url } }) => {
  console.error(error);
};
