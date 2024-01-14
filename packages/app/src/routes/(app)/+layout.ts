import { CURRENT_VERSION } from '$lib/buildinfo.js';
import { Selector, SortDirection, loadQuery } from '$lib/zeus.js';

export const ssr = false;

export const _changelogChangeQuery = Selector('ReleaseChange')({
  authors: true,
  issues: true,
  mergeRequests: true,
  reporters: true,
  html: true,
});

export async function load({ parent, fetch }) {
  const { combinedChangelog } = await loadQuery(
    {
      combinedChangelog: [
        {
          sort: SortDirection.Descending,
          to: CURRENT_VERSION,
        },
        {
          '__typename': true,
          '...on QueryCombinedChangelogSuccess': {
            data: {
              version: true,
              date: true,
              description: true,
              changes: {
                added: _changelogChangeQuery,
                fixed: _changelogChangeQuery,
                improved: _changelogChangeQuery,
                other: _changelogChangeQuery,
                security: _changelogChangeQuery,
              },
            },
          },
          '...on Error': {
            message: true,
          },
        },
      ],
    },
    { parent, fetch },
  );

  if (combinedChangelog.__typename === 'Error') return { combinedChangelog: [] };

  return { combinedChangelog: combinedChangelog.data };
}
