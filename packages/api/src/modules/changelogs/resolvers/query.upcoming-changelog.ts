import { builder } from '#lib';
import {
  ChangelogReleaseType,
  UpcomingVersion,
  changelogFromFile,
  findReleaseInChangelog,
} from '../index.js';

builder.queryField('upcomingChangelog', (t) =>
  t.field({
    type: ChangelogReleaseType,
    errors: {},
    async resolve() {
      const futureChangelogFile = await fetch(
        `https://git.inpt.fr/inp-net/churros/-/raw/main/CHANGELOG.md`,
      );
      return findReleaseInChangelog(
        await changelogFromFile(await futureChangelogFile.text()),
        UpcomingVersion,
      );
    },
  }),
);
