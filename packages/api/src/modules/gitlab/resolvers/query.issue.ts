import { builder } from '#lib';

import { GraphQLError } from 'graphql';
import { IssueType, gitlabAPIIssueQuery, makeIssue, type GitlabIssue } from '../index.js';

builder.queryField('issue', (t) =>
  t.field({
    type: IssueType,
    args: {
      number: t.arg.int(),
    },
    async resolve(_, { number }) {
      let data: null | (GitlabIssue & { closedAsDuplicateOf: null | GitlabIssue });
      try {
        data = await fetch(`https://git.inpt.fr/api/graphql`, {
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
        throw new GraphQLError('Connexion à git.inpt.fr impossible');
      }

      if (!data) throw new GraphQLError('Signalement non trouvé');

      const { closedAsDuplicateOf, ...issue } = data;
      return makeIssue(closedAsDuplicateOf ?? issue, closedAsDuplicateOf ? issue.iid : undefined);
    },
  }),
);
