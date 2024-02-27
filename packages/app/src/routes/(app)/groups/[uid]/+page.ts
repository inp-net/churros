import { byMemberGroupTitleImportance } from '$lib/sorting';
import { get } from 'svelte/store';
import type { AfterLoadEvent, GroupProfileVariables } from './$houdini';

export const _GroupProfileVariables: GroupProfileVariables = async ({ params, parent }) => {
  const { AppLayout } = await parent();
  // @ts-expect-error TODO fix this
  const external = (await get(AppLayout).data.me.external) as boolean;
  return {
    ...params,
    isStudent: !external,
  };
};

export function _houdini_afterLoad({ data }: AfterLoadEvent) {
  data.GroupProfile.group.members?.sort(byMemberGroupTitleImportance);
  return data;
}
