import { CURRENT_VERSION, builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import * as SemVer from 'semver';

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
