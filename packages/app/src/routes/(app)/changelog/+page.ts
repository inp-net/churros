import { CURRENT_VERSION } from '$lib/buildinfo';
import type { ChangelogPageVariables } from './$houdini';

// TODO find another way to have loggedIn not required in the object
export const _ChangelogPageVariables: Partial<ChangelogPageVariables> = () => ({
  currentVersion: CURRENT_VERSION,
});
