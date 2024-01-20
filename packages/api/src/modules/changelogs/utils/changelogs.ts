import * as KeepAChangelog from 'keep-a-changelog';
import { readFile } from 'node:fs/promises';

export const UpcomingVersion = Symbol('UpcomingVersion');
class ChurrosRelease extends KeepAChangelog.Release {
  constructor(
    version: string | undefined,
    date: string | Date | undefined,
    changes: string | undefined,
  ) {
    super(version, date, changes);
    this.changes = new Map(
      ['corrections', 'améliorations', 'nouveautés', 'sécurité', 'technique', 'autres'].map((t) => [
        t,
        [],
      ]),
    );
  }
}

export async function changelogFromFile(fileContents?: string) {
  return KeepAChangelog.parser(fileContents ?? (await readFile('static/CHANGELOG.md', 'utf8')), {
    releaseCreator: (version, date, changes) => new ChurrosRelease(version, date, changes),
  });
}
