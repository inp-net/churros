import { ZeusError } from '$lib/zeus';
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error }) => {
  if (error instanceof ZeusError) return new Error(error.message);

  console.error(error);
};
