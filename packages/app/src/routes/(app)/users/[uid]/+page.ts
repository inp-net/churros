import { byMemberGroupTitleImportance } from '$lib/sorting';
import { get } from 'svelte/store';
import type { AfterLoadEvent, UserProfileVariables } from './$houdini';

export const _UserProfileVariables: UserProfileVariables = async ({ params, parent }) => {
  const { AppLayout } = await parent();
  // @ts-expect-error TODO fix this
  const myUid = get(AppLayout)!.data.me!.uid! as string;
  // @ts-expect-error TODO fix this
  const canEditUsers = get(AppLayout)!.data.me!.canEditUsers! as boolean;
  return {
    ...params,
    isMe: myUid === params.uid,
    showContributions: canEditUsers || myUid === params.uid,
  };
};

export function _houdini_afterLoad({ data }: AfterLoadEvent) {
  data.UserProfile.user.groups.sort(byMemberGroupTitleImportance);
  return {
    ...data,
    isDeveloper:
      data.UserProfile.codeContributors.__typename === 'QueryCodeContributorsSuccess'
        ? data.UserProfile.codeContributors.data.some((c) => c.uid === data.UserProfile.user.uid)
        : false,
  };
}
