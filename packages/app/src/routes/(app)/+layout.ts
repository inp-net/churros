import { CURRENT_VERSION } from '$lib/buildinfo';

export const ssr = false;
export const _AppLayoutVariables = async () => ({
  version: CURRENT_VERSION,
});
