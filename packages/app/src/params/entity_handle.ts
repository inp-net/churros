/* eslint-disable unicorn/filename-case */
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^@([\w-])+$/.test(param);
