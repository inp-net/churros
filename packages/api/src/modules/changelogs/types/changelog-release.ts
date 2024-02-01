import { builder, toHtml } from '#lib';
import { DateTimeScalar } from '#modules/global';
import * as KeepAChangelog from 'keep-a-changelog';
import { ReleaseChangesMap, ReleaseChangesMapType, UpcomingVersion } from '../index.js';

export class ChangelogRelease {
  version!: string;
  date: Date | undefined;
  changes!: ReleaseChangesMap;
  description!: string;

  constructor(
    version: string | typeof UpcomingVersion,
    date: Date | undefined,
    changes: ReleaseChangesMap,
    description = '',
  ) {
    this.version = version === UpcomingVersion ? '' : version;
    this.date = date;
    this.changes = changes;
    this.description = description;
  }
  static findIn(changelog: KeepAChangelog.Changelog, version: typeof UpcomingVersion | string) {
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

    const changes = new ReleaseChangesMap();
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

    return new ChangelogRelease(
      release.version ?? UpcomingVersion,
      release.date,
      changes,
      release.description,
    );
  }
}

export const ChangelogReleaseType = builder.objectType(ChangelogRelease, {
  name: 'ChangelogRelease',
  description: 'A release in the changelog',
  fields: (t) => ({
    version: t.exposeString('version', { description: 'The version of the release' }),
    date: t.expose('date', {
      type: DateTimeScalar,
      nullable: true,
      description: 'The date of the release',
    }),
    changes: t.expose('changes', {
      type: ReleaseChangesMapType,
      description: 'The changes of the release, grouped by category',
    }),
    description: t.exposeString('description', {
      description: 'A short description of the release',
    }),
    descriptionHtml: t.string({
      description: 'A short description of the release, in HTML. Safe from XSS.',
      async resolve({ description }) {
        return toHtml(description);
      },
    }),
  }),
});
