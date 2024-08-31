import type { ParamMatcher } from '@sveltejs/kit';
import { _RESERVED_USERNAMES } from '../routes/check-uid/[uid]/+server';

export const match: ParamMatcher = (param) =>
  /^[\w-]{2,255}$/.test(param) && !_RESERVED_USERNAMES.has(param);
