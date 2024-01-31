import { builder } from '#lib';

import { GraphQLError } from 'graphql';
import {
  IssueType,
  gitlabAPIIssueQuery as issueQuery,
  makeIssue,
  type GitlabAPIResponse,
} from '../index.js';
// TODO rename to user.submitted-issues

builder.queryField('issuesByUser', (t) =>
  t.field({
    type: [IssueType],
    async resolve(_, __, { user }) {
      if (!user) return [];

      const query = (uid: string) => `query {
        project(fullPath: "inp-net/churros") {
          fromIssuebot: issues(search: "@${uid}", first: 20) {
            nodes {
              ${issueQuery}, closedAsDuplicateOf { ${issueQuery} }
            }
          }
          fromGitlabUsers: issues(authorUsername: "${uid}", first: 20) {
            nodes {
              ${issueQuery}, closedAsDuplicateOf { ${issueQuery} }
            }
          }
        }
      }`;

      const { fromIssuebot, fromGitlabUsers } = await fetch(`https://git.inpt.fr/api/graphql`, {
        body: JSON.stringify({ query: query(user.uid) }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async (r) => r.json())
        .then(
          (r) =>
            /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
            (r.data?.project
              ? // @ts-expect-error untyped api response
                Object.fromEntries(Object.entries(r.data.project).map(([k, v]) => [k, v.nodes!]))
              : {
                  fromIssuebot: [],
                  fromGitlabUsers: [],
                }) as GitlabAPIResponse,
          /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
        )
        .catch(() => {
          throw new GraphQLError('Connexion à git.inpt.fr impossible');
        });

      const allIssues = [...fromIssuebot, ...fromGitlabUsers];

      return allIssues.map(({ closedAsDuplicateOf, ...issue }) =>
        makeIssue(closedAsDuplicateOf ?? issue, closedAsDuplicateOf ? issue.iid : undefined),
      );
    },
  }),
);
