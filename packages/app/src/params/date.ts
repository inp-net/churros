import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^\d{4}-\d{2}-\d{2}$/.test(param);
