import { builder } from '#lib';
import { ReleaseChangesMapType, type ReleaseChangesMap } from './release-changes-map.js';

export type ChangelogCombinedReleases = {
  versions: string[];
  changes: ReleaseChangesMap;
};

export const ChangelogCombinedReleasesType = builder
  .objectRef<ChangelogCombinedReleases>('ChangelogCombinedReleases')
  .implement({
    description: 'Combined releases for showing a changelog for multiple versions at once',
    fields: (t) => ({
      versions: t.exposeStringList('versions', { description: 'The versions of the releases' }),
      changes: t.expose('changes', {
        type: ReleaseChangesMapType,
        description: 'The changes of the releases, grouped by category',
      }),
    }),
  });
