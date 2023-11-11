import uniqBy from 'lodash.uniqby';
import { builder } from '../builder.js';
import { UserType } from '../objects/users.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar } from '../objects/scalars.js';
import { toHtml } from './markdown.js';

builder.queryField('codeContributors', (t) =>
  t.prismaField({
    type: [UserType],
    authScopes: () => true,
    async resolve() {
      const codeContributors = (await fetch(
        `https:///git.inpt.fr/api/v4/projects/${process.env.GITLAB_PROJECT_ID}/repository/contributors`,
      ).then(async (r) => r.json())) as Array<{
        name: string;
        email: string;
        commits: number;
        additions: number;
        deletions: number;
      }>;
      const contributorEmails = [
        ...new Set(codeContributors.map((contributor) => contributor.email)),
      ];
      const uids = contributorEmails
        .filter((e) => e.endsWith('@bde.enseeiht.fr'))
        .map((e) => e.replace('@bde.enseeiht.fr', ''));

      const users = await prisma.user.findMany({
        where: {
          OR: [
            { email: { in: contributorEmails } },
            {
              otherEmails: { hasSome: contributorEmails },
            },
            {
              uid: { in: uids },
            },
          ],
        },
      });

      return uniqBy(users, (u) => u.id);
    },
  }),
);

const ISSUE_IMPORTANCE_LABELS_MAP_UNBOUNDED = {
  'importance:rockbottom': 0,
  'importance:low': 1,
  'importance:medium': 2,
  'importance:high': 3,
  'importance:urgent': 4,
};

const ISSUE_DIFFICULTY_LABELS_MAP_UNBOUNDED = {
  'difficulty:braindead': 0,
  'difficulty:easy': 1,
  'difficulty:moderate': 2,
  'difficulty:hard': 3,
  'difficulty:unknown': 4,
};

enum IssueState {
  Open,
  Closed,
  Deployed,
}

class Issue {
  title!: string;
  state!: IssueState;
  body!: string;
  submittedAt!: Date;
  importance!: number | null;
  difficulty!: number | null;
  number!: number;
  deployedIn!: string;

  constructor(args: Issue) {
    Object.assign(this, args);
  }
}
export const IssueStateType = builder.enumType(IssueState, {
  name: 'IssueState',
});

export const IssueType = builder.objectType(Issue, {
  name: 'Issue',
  description: 'A Gitlab issue',
  fields: (t) => ({
    title: t.exposeString('title'),
    state: t.expose('state', { type: IssueStateType }),
    body: t.exposeString('body'),
    bodyHtml: t.string({
      async resolve({ body }) {
        return toHtml(body);
      },
    }),
    submittedAt: t.expose('submittedAt', {
      type: DateTimeScalar,
      description: 'The date at which the issue was submitted',
    }),
    importance: t.exposeFloat('importance', {
      nullable: true,
      description: 'Expressed from 0 to 1',
    }),
    difficulty: t.exposeFloat('difficulty', {
      nullable: true,
      description: 'Expressed from 0 to 1',
    }),
    number: t.exposeInt('number'),
    url: t.string({
      resolve({ number }) {
        return `https://git.inpt.fr/inp-net/churros/-/issues/${number}`;
      },
    }),
    deployedIn: t.exposeString('deployedIn'),
  }),
});

builder.queryField('issuesByUser', (t) =>
  t.field({
    type: [IssueType],
    async resolve(_, __, { user }) {
      if (!user) return [];
      type GitlabAPIResponse = Array<{
        state: string;
        description: string;
        updated_at: string;
        iid: number;
        labels: string[];
        title: string;
      }>;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const byUsername: GitlabAPIResponse = await fetch(
        `https://git.inpt.fr/api/v4/projects/${process.env.GITLAB_PROJECT_ID}/issues?author_username=${user.uid}`,
      ).then(async (r) => r.json());

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let bySearch: GitlabAPIResponse = await fetch(
        `https://git.inpt.fr/api/v4/projects/${process.env.GITLAB_PROJECT_ID}/issues?search=@${user.uid}`,
      ).then(async (r) => r.json());
      bySearch = bySearch.filter(({ description }) =>
        description.includes(`[@${user.uid}](https://`),
      );

      const allIssues = [...byUsername, ...bySearch];

      const difficultyOrImportanceFromLabel = (map: Record<string, number>, labels: string[]) => {
        const highestUnbounded = Math.max(...labels.map((l) => map[l] ?? Number.NEGATIVE_INFINITY));
        // eslint-disable-next-line unicorn/no-null
        if (highestUnbounded === Number.NEGATIVE_INFINITY) return null;
        return highestUnbounded / Object.values(map).length;
      };

      return allIssues.map(
        ({ state, description, updated_at, iid, labels, title }) =>
          new Issue({
            title,
            body: description,
            difficulty: difficultyOrImportanceFromLabel(
              ISSUE_DIFFICULTY_LABELS_MAP_UNBOUNDED,
              labels,
            ),
            importance: difficultyOrImportanceFromLabel(
              ISSUE_IMPORTANCE_LABELS_MAP_UNBOUNDED,
              labels,
            ),
            number: iid,
            state: state === 'closed' ? IssueState.Closed : IssueState.Open,
            submittedAt: new Date(updated_at),
            deployedIn: '', // TODO
          }),
      );
    },
  }),
);

builder.mutationField('createGitlabIssue', (t) =>
  t.field({
    type: 'Int',
    args: {
      title: t.arg.string(),
      description: t.arg.string(),
      isBug: t.arg.boolean(),
    },
    authScopes: () => true,
    async resolve(_, { title, description, isBug }, { user }) {
      let hasGitlabAccount = false;
      if (user) {
        const data = (await fetch(`https://git.inpt.fr/api/v4/users?username=${user.uid}`).then(
          async (r) => r.json(),
        )) as unknown as unknown[];
        hasGitlabAccount = data.length > 0;
      }

      const url = (path: string) => {
        const result = new URL('/api/v4/' + path, `https://git.inpt.fr/`);
        result.searchParams.set('sudo', (hasGitlabAccount ? user?.uid : undefined) ?? 'issuebot');
        result.searchParams.set('private_token', process.env.GITLAB_SUDO_TOKEN);
        return result.toString();
      };

      const response = await fetch(url(`/projects/${process.env.GITLAB_PROJECT_ID}/issues`), {
        method: 'POST',
        body: JSON.stringify({
          description:
            description +
            (hasGitlabAccount
              ? ''
              : `\n\n\n -- ${
                  user ? `[@${user.uid}](https://churros.inpt.fr/users/${user.uid})` : 'Anonymous'
                }`),
          title: title || description.split('. ')[0],
          labels:
            [isBug ? 'bug' : 'feature'].join(',') +
            (!user || !user?.groups.some((g) => g.group.uid === 'devs') ? ',user-submitted' : ''),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: unknown = await response.json();

      if (response.ok) return (data as { iid: number }).iid;

      return 0;
    },
  }),
);
