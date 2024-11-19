import { builder, ENV } from '#lib';

import { GraphQLError } from 'graphql';
import { gitlabAPIIssueQuery, IssueType, makeIssue, type GitlabIssue } from '../index.js';

builder.queryField('issue', (t) =>
  t.field({
    type: IssueType,
    args: {
      number: t.arg.int(),
    },
    async resolve(_, { number }) {
      const gitlabOrigin = new URL(ENV.PUBLIC_REPOSITORY_URL).origin;
      let data: null | (GitlabIssue & { closedAsDuplicateOf: null | GitlabIssue });
      try {
        data = await fetch(`${gitlabOrigin}/api/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `query {
            project(fullPath: "inp-net/churros") {
              issue(iid: "${number}") {
                ${gitlabAPIIssueQuery}, closedAsDuplicateOf { ${gitlabAPIIssueQuery} }
              }
            }
          }`,
          }),
        })
          .then(async (r) => r.json())
          .then(
            /* eslint-disable unicorn/no-null, @typescript-eslint/no-unsafe-member-access */
            (j) => j.data?.project?.issue ?? null,
            /* eslint-enable unicorn/no-null, @typescript-eslint/no-unsafe-member-access */
          );
      } catch {
        throw new GraphQLError(`Connexion à ${new URL(ENV.PUBLIC_REPOSITORY_URL).host} impossible`);
      }

      if (!data) throw new GraphQLError('Signalement non trouvé');

      const { closedAsDuplicateOf, ...issue } = data;
      return makeIssue(closedAsDuplicateOf ?? issue, closedAsDuplicateOf ? issue.iid : undefined);
    },
  }),
);
