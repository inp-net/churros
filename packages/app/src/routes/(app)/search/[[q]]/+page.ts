import type { BeforeLoadEvent, SearchResultsVariables } from './$houdini';

export function _houdini_beforeLoad({ params }: BeforeLoadEvent) {
  if (!params.q) {
    return {
      SearchResults: {
        searchUsers: [],
        searchGroups: [],
      },
    };
  }
}

export const _SearchResultsVariables: SearchResultsVariables = ({ params, url }) => ({
  q: params.q ?? '',
  cutoff: url.searchParams.get('sim') ? Number.parseFloat(url.searchParams.get('sim')!) : undefined,
});
