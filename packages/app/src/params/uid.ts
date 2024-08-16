import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^[\w_-]{3,255}$/.test(param);
