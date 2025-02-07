import type { PageLogsVariables } from './$houdini';

export const _PageLogsVariables: PageLogsVariables = ({ url }) => {
  return {
    user: url.searchParams.get('user') ?? null,
    area: url.searchParams.get('area') ?? null,
    action: url.searchParams.get('action') ?? null,
    target: url.searchParams.get('target') ?? null,
    message: url.searchParams.get('message') ?? null,
    open: url.searchParams.get('open') ?? 'log:notfound',
  };
};
