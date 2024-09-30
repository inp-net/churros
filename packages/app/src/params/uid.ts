import { env } from '$env/dynamic/public';
import type { ParamMatcher } from '@sveltejs/kit';
import { _RESERVED_USERNAMES } from '../routes/check-uid/[uid]/+server';

const storageURLPathFragments = new URL(env.PUBLIC_STORAGE_URL).pathname.split('/');

export const match: ParamMatcher = (param) =>
  /^[\w-]{2,255}$/.test(param) &&
  !_RESERVED_USERNAMES.has(param) &&
  // Prevent client-side routing to the storage URL
  (storageURLPathFragments.length > 1 ? storageURLPathFragments[1] !== param : true);
