import { builder } from '#lib';
import {
  ChangelogRelease,
  ChangelogReleaseType,
  UpcomingVersion,
  changelogFromFile,
} from '../index.js';

builder.queryField('upcomingChangelog', (t) =>
  t.field({
    type: ChangelogReleaseType,
    errors: {},
    async resolve() {
      const futureChangelogFile = await fetch(
        `https://git.inpt.fr/inp-net/churros/-/raw/main/CHANGELOG.md`,
      );
      return ChangelogRelease.findIn(
        await changelogFromFile(await futureChangelogFile.text()),
        UpcomingVersion,
      );
    },
  }),
);
