import type { AppLayout$input } from '$houdini';
import { CURRENT_VERSION } from '$lib/buildinfo';
import type { VariableFunctionFixed } from '$lib/typing';
import type { LayoutParams } from './$houdini';

export const ssr = false;
export const _AppLayoutVariables: VariableFunctionFixed<LayoutParams, AppLayout$input> = async ({
  route,
  params,
}) => {
  let vars = {
    version: CURRENT_VERSION,
    eventUid: '',
    groupUid: '',
    scanningEvent: false,
  };

  if (route.id === '/(app)/events/[group]/[uid]/scan') {
    vars = {
      ...vars,
      eventUid: params.uid ?? '',
      groupUid: params.group ?? '',
      scanningEvent: true,
    };
  }

  return vars;
};
