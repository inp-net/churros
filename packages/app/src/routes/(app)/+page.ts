import { loadAll, load_Birthdays, load_MyGroups, load_PageHomeFeed } from '$houdini';

export async function load(event) {
  return loadAll(load_PageHomeFeed({ event }), load_Birthdays({ event }), load_MyGroups({ event }));
}
