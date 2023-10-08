/* eslint-disable unicorn/filename-case */
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^\d+a(-fis(e|a))?$/.test(param);
