import { CURRENT_VERSION, builder, prisma } from '#lib';
import { SortDirection, SortDirectionEnum } from '#modules/global';
import { GraphQLError } from 'graphql';
import * as SemVer from 'semver';
import { ChangelogReleaseType, changelogFromFile, findReleaseInChangelog } from '../index.js';

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
        const { latestVersionSeenInChangelog } = await prisma.user.findUniqueOrThrow({
          where: { id: user.id },
          select: { latestVersionSeenInChangelog: true },
        });
        from = latestVersionSeenInChangelog ?? '0.0.0';
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

      return selectedReleases.map((release) => findReleaseInChangelog(changelog, release.version!));
    },
  }),
);
