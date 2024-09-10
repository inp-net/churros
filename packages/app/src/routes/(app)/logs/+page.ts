import type { PageLogsVariables } from './$houdini';

export const _PageLogsVariables: PageLogsVariables = ({ url }) => {
  return {
    user: url.searchParams.get('user') ?? null,
    area: url.searchParams.get('area') ?? null,
    message: url.searchParams.get('message') ?? null,
  };
};
