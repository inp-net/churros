import * as KeepAChangelog from 'keep-a-changelog';
import { readFile } from 'node:fs/promises';
import * as SemVer from 'semver';
import { type ChangelogRelease, type ReleaseChangesMap } from '../index.js';

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
  const parsed = KeepAChangelog.parser(
    fileContents ?? (await readFile('static/CHANGELOG.md', 'utf8')),
    {
      releaseCreator: (version, date, changes) => new ChurrosRelease(version, date, changes),
    },
  );

  // Ignore invalid versions and pre-releases
  parsed.releases = parsed.releases.filter(
    (release) =>
      release.version &&
      SemVer.valid(release.version) &&
      SemVer.prerelease(release.version) === null,
  );

  return parsed;
}

export function findReleaseInChangelog(
  changelog: KeepAChangelog.Changelog,
  version: typeof UpcomingVersion | string,
): ChangelogRelease {
  const release =
    version === UpcomingVersion
      ? changelog.releases.find((r) => !r.version)
      : changelog.findRelease(version);

  if (!release) {
    throw new Error(
      version === UpcomingVersion
        ? `Aucun changelog trouvé pour la version prochaine`
        : `Aucun changelog trouvé pour la version ${version}.`,
    );
  }

  const changes: ReleaseChangesMap = {
    fixed: [],
    improved: [],
    added: [],
    security: [],
    other: [],
    technical: [],
  };
  for (const [type, changesOfType] of release.changes) {
    for (const change of changesOfType) {
      const releaseChange = {
        text: change.title + (change.description ? `\n${change.description}` : ''),
        issues: change.issues.map((i) => Number.parseInt(i, 10)).filter((i) => !Number.isNaN(i)),
        reporters: [], //TODO
        mergeRequests: [], //TODO
        authors: [], //TODO
      };
      switch (type) {
        case 'corrections': {
          changes.fixed.push(releaseChange);
          break;
        }
        case 'améliorations': {
          changes.improved.push(releaseChange);
          break;
        }
        case 'nouveautés': {
          changes.added.push(releaseChange);
          break;
        }
        case 'sécurité': {
          changes.security.push(releaseChange);
          break;
        }
        case 'technique': {
          changes.technical.push(releaseChange);
          break;
        }
        default: {
          changes.other.push(releaseChange);
          break;
        }
      }
    }
  }

  return {
    version: release.version ?? '',
    date: release.date,
    changes: changes,
    description: release.description,
  };
}
