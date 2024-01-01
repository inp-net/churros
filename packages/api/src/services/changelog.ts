import { CURRENT_VERSION, builder } from '#lib';
import { GraphQLError } from 'graphql';
import * as KeepAChangelog from 'keep-a-changelog';
import { readFileSync } from 'node:fs';
import { formatDate } from '../date.js';
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

builder.queryField('changelog', (t) =>
  t.field({
    // TODO use an HTML scalar
    type: 'String',
    args: {
      version: t.arg.string({
        required: false,
        description: `The version to request a changelog for. Defaults to the current version (${CURRENT_VERSION}).`,
      }),
    },
    async resolve(_, { version }) {
      const changelog = KeepAChangelog.parser(readFileSync('static/CHANGELOG.md', 'utf8'), {
        releaseCreator: (version, date, changes) => new ChurrosRelease(version, date, changes),
      });

      const release = changelog.findRelease(version ?? CURRENT_VERSION);
      if (!release) {
        throw new GraphQLError(
          `Aucun changelog trouvé pour la version ${version ?? CURRENT_VERSION}.`,
        );
      }

      const titleCase = (s: string) => s[0]?.toUpperCase() + s.slice(1);

      const changes = [...release.changes.entries()]
        .filter(([, changes]) => changes.length > 0)
        .map(
          ([category, changes]) => `## ${titleCase(category)}\n\n${changes.map(String).join('\n')}`,
        )
        .join('\n\n');

      return toHtml(
        [
          `<span class="date">${formatDate(release.date)}</span>`,
          `# ${release.version}`,
          changes,
        ].join('\n\n'),
      );
    },
  }),
);
