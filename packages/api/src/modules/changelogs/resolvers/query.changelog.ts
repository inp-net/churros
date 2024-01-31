import { CURRENT_VERSION, builder } from '#lib';
import { ChangelogRelease, ChangelogReleaseType, changelogFromFile } from '../index.js';
import * as SemVer from 'semver';

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
