import { builder, ENV } from '#lib';
import {
  changelogFromFile,
  ChangelogReleaseType,
  findReleaseInChangelog,
  UpcomingVersion,
} from '../index.js';

builder.queryField('upcomingChangelog', (t) =>
  t.field({
    type: ChangelogReleaseType,
    errors: {},
    async resolve() {
      const futureChangelogFile = await fetch(
        `${ENV.PUBLIC_REPOSITORY_URL}/-/raw/main/CHANGELOG.md`,
      );
      return findReleaseInChangelog(
        await changelogFromFile(await futureChangelogFile.text()),
        UpcomingVersion,
      );
    },
  }),
);
