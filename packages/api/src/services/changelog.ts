import { CURRENT_VERSION, builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import * as KeepAChangelog from 'keep-a-changelog';
import { readFile } from 'node:fs/promises';
import * as SemVer from 'semver';
import { DateTimeScalar, SortDirection, SortDirectionEnum } from '../objects/scalars.js';
import { toHtml } from './markdown.js';

class ChurrosRelease extends KeepAChangelog.Release {
  constructor(
    version: string | undefined,
    date: string | Date | undefined,
    changes: string | undefined,
  ) {
    super(version, date, changes);
    this.changes = new Map(
      ['correctifs', 'améliorations', 'nouveautés', 'sécurité', 'autres'].map((t) => [t, []]),
    );
  }
}

class ReleaseChange {
  text!: string;
  authors!: string[];
  reporters!: string[];
  issues!: number[];
  mergeRequests!: number[];

  constructor(
    text: string,
    issues: number[],
    reporters: string[],
    mergeRequests: number[],
    authors: string[],
  ) {
    this.text = text;
    this.authors = authors;
    this.issues = issues;
    this.mergeRequests = mergeRequests;
    this.reporters = reporters;
  }
}

class ReleaseChangesMap {
  fixed!: ReleaseChange[];
  improved!: ReleaseChange[];
  added!: ReleaseChange[];
  security!: ReleaseChange[];
  other!: ReleaseChange[];

  constructor(
    fixed: ReleaseChange[] = [],
    improved: ReleaseChange[] = [],
    added: ReleaseChange[] = [],
    security: ReleaseChange[] = [],
    other: ReleaseChange[] = [],
  ) {
    this.fixed = fixed;
    this.improved = improved;
    this.added = added;
    this.security = security;
    this.other = other;
  }
}

class ChangelogRelease {
  version!: string;
  date: Date | undefined;
  changes!: ReleaseChangesMap;

  constructor(version: string, date: Date | undefined, changes: ReleaseChangesMap) {
    this.version = version;
    this.date = date;
    this.changes = changes;
  }
  static findIn(changelog: KeepAChangelog.Changelog, version: string) {
    const release = changelog.findRelease(version);
    if (!release || !release.version)
      throw new Error(`Aucun changelog trouvé pour la version ${version}.`);

    const changes = new ReleaseChangesMap();
    for (const [type, changesOfType] of release.changes) {
      for (const change of changesOfType) {
        const releaseChange = new ReleaseChange(
          change.title + (change.description ? `\n${change.description}` : ''),
          change.issues.map((i) => Number.parseInt(i, 10)).filter((i) => !Number.isNaN(i)),
          [], //TODO
          [], //TODO
          [], //TODO
        );
        switch (type) {
          case 'correctifs': {
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
          default: {
            changes.other.push(releaseChange);
            break;
          }
        }
      }
    }

    return new ChangelogRelease(release.version, release.date, changes);
  }
}

async function changelogFromFile() {
  return KeepAChangelog.parser(await readFile('static/CHANGELOG.md', 'utf8'), {
    releaseCreator: (version, date, changes) => new ChurrosRelease(version, date, changes),
  });
}

export const ReleaseChangeType = builder.objectType(ReleaseChange, {
  name: 'ReleaseChange',
  description: 'A change in the changelog',
  fields: (t) => ({
    text: t.exposeString('text', { description: 'The text of the change' }),
    html: t.string({
      async resolve({ text }) {
        return toHtml(text);
      },
    }),
    authors: t.exposeStringList('authors', {
      description: 'The authors of the change',
    }),
    issues: t.exposeIntList('issues', {
      description: 'Issues linked to the change',
    }),
    mergeRequests: t.exposeIntList('mergeRequests', {
      description: 'Merge requests linked to the change',
    }),
    reporters: t.exposeStringList('reporters', {
      description: 'People who created the issues (gave the idea, reported the bug, etc.)',
    }),
  }),
});

export const ReleaseChangesMapType = builder.objectType(ReleaseChangesMap, {
  name: 'ReleaseChangesMap',
  description: 'Changes in the changelog, grouped by category',
  fields: (t) => ({
    fixed: t.expose('fixed', { type: ['ReleaseChange'], description: 'What was fixed' }),
    improved: t.expose('improved', {
      type: ['ReleaseChange'],
      description: 'What was improved',
    }),
    added: t.expose('added', { type: ['ReleaseChange'], description: 'New features' }),
    security: t.expose('security', {
      type: ['ReleaseChange'],
      description: 'Security changes',
    }),
    other: t.expose('other', { type: ['ReleaseChange'], description: 'Miscalleanous changes' }),
  }),
});

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
  }),
});

builder.queryField('combinedChangelog', (t) =>
  t.field({
    type: [ChangelogReleaseType],
    errors: {},
    description: `A changelog for multiple versions. 
Be careful, this range is (from, to]. I.e. **the first version is excluded, and the last is included**. 
This is way more useful for querying a range of versions for a changelog, but not the usual way ranges are defined.`,
    validate({ from, to }) {
      if (from && to) return SemVer.lte(from, to);
      return true;
    },
    args: {
      sort: t.arg({
        type: SortDirectionEnum,
        defaultValue: SortDirection.Ascending,
      }),
      from: t.arg.string({
        required: false,
        description:
          'The version to start from, **exclusive**. Leave empty to start from the latest version the user has seen',
        validate: {
          refine: (value) => Boolean(SemVer.valid(value, { loose: true })),
        },
      }),
      to: t.arg.string({
        description: `The version to end at, **inclusive**. Leave empty to end at the current version (${CURRENT_VERSION}).`,
        // validate: {
        //   refine: (value) => Boolean(SemVer.valid(value, { loose: true })),
        // },
        defaultValue: CURRENT_VERSION,
      }),
    },
    async resolve(_, { from, to, sort }, { user }) {
      if (!from) {
        if (!user) {
          throw new GraphQLError(
            'Provide a value for the "from" argument or authenticate as a user.',
          );
        }
        from = user.latestVersionSeenInChangelog;
      }

      if (SemVer.gte(from, to)) return [];

      const changelog = await changelogFromFile();
      const selectedReleases = changelog.releases
        .filter(
          (release) =>
            release.version && SemVer.gt(release.version, from!) && SemVer.lte(release.version, to),
        )
        .sort((a, b) => SemVer.compare(a.version!, b.version!));

      if (sort === SortDirection.Descending) selectedReleases.reverse();

      if (selectedReleases.length === 0)
        throw new GraphQLError(`Aucune version entre ${from} et ${to}.`);

      return selectedReleases.map((release) =>
        ChangelogRelease.findIn(changelog, release.version!),
      );
    },
  }),
);

builder.queryField('changelog', (t) =>
  t.field({
    type: ChangelogReleaseType,
    args: {
      version: t.arg.string({
        required: false,
        description: `The version to request a changelog for. Defaults to the current version (${CURRENT_VERSION}).`,
        validate: {
          refine: (value) =>
            Boolean(
              SemVer.valid(value, {
                loose: true,
              }),
            ),
        },
      }),
    },
    async resolve(_, { version }) {
      return ChangelogRelease.findIn(await changelogFromFile(), version ?? CURRENT_VERSION);
    },
  }),
);

builder.mutationField('acknowledgeChangelog', (t) =>
  t.boolean({
    description: "Marks the user as having seen the given version's changelog.",
    authScopes: { loggedIn: true },
    args: {
      version: t.arg.string({
        validate: { refine: (value) => Boolean(SemVer.valid(value, { loose: true })) },
        defaultValue: CURRENT_VERSION,
      }),
    },
    async resolve(_, { version }, { user }) {
      if (!user) throw new GraphQLError('Not logged in');
      await prisma.user.update({
        where: { id: user.id },
        data: { latestVersionSeenInChangelog: version },
      });
      return true;
    },
  }),
);
