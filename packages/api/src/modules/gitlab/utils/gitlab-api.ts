import {
  ISSUE_DIFFICULTY_LABELS,
  ISSUE_IMPORTANCE_LABELS,
  IssueState,
  difficultyOrImportanceFromLabel,
} from '../index.js';

export type GitlabIssue = {
  state: string;
  description: string;
  updatedAt: string;
  iid: number;
  labels: { nodes: Array<{ title: string }> };
  title: string;
  discussions: {
    nodes: Array<{
      notes: {
        nodes: Array<{
          body: string;
          system: boolean;
          internal: boolean;
          author: { avatarUrl: string; name: string; webUrl: string };
          createdAt: string;
        }>;
      };
    }>;
  };
};
export type GitlabAPIResponse = {
  fromIssuebot: Array<GitlabIssue & { closedAsDuplicateOf: null | GitlabIssue }>;
  fromGitlabUsers: Array<GitlabIssue & { closedAsDuplicateOf: null | GitlabIssue }>;
};

export const gitlabAPIIssueQuery = `
  state
  description
  updatedAt
  iid
  labels { nodes { title }}
  title
  discussions { nodes { notes { nodes {
    body
    system
    internal
    author { avatarUrl name webUrl }
    createdAt
  }}}}
`;

export function makeIssue(
  { state, description, updatedAt, iid, labels, title, discussions }: GitlabIssue,
  duplicatedFrom: number | undefined,
) {
  return {
    title,
    body: description,
    difficulty: difficultyOrImportanceFromLabel(ISSUE_DIFFICULTY_LABELS, labels),
    importance: difficultyOrImportanceFromLabel(ISSUE_IMPORTANCE_LABELS, labels),
    number: iid,
    state: state === 'closed' ? IssueState.Closed : IssueState.Open,
    submittedAt: new Date(updatedAt),
    deployedIn: '', // TODO
    // eslint-disable-next-line unicorn/no-null
    duplicatedFrom: duplicatedFrom ?? null,
    comments: discussions.nodes.flatMap((discussion) =>
      discussion.notes.nodes
        .filter((node) => !node.system && !node.internal)
        .map((node) => ({
          body: node.body,
          authorName: node.author.name,
          authorAvatarUrl: node.author.avatarUrl,
          authorGitlabUrl: node.author.webUrl,
          addedAt: new Date(node.createdAt),
        })),
    ),
  };
}
