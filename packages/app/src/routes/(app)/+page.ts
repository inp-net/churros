import { load_Birthdays, load_MyGroups, load_PageHomeFeed, loadAll } from '$houdini';

export const ssr = true;

export async function load(event) {
  return loadAll(load_PageHomeFeed({ event }), load_Birthdays({ event }), load_MyGroups({ event }));
}
