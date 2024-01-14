import { CURRENT_VERSION } from '$lib/buildinfo';
import { SortDirection, loadQuery } from '$lib/zeus';
import { error } from '@sveltejs/kit';
import { _changelogChangeQuery } from '../+layout';

export async function load({ fetch, parent }) {
  const { combinedChangelog, upcomingChangelog } = await loadQuery(
    {
      upcomingChangelog: {
        '__typename': true,
        '...on QueryUpcomingChangelogSuccess': {
          data: {
            version: true,
            date: true,
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
      combinedChangelog: [
        {
          sort: SortDirection.Descending,
          from: '0.0.0',
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
    { fetch, parent },
  );

  if (combinedChangelog.__typename === 'Error') throw error(500, combinedChangelog.message);

  return {
    combinedChangelog: combinedChangelog.data,
    upcomingChangelog:
      upcomingChangelog.__typename === 'Error' ? undefined : upcomingChangelog.data,
  };
}
