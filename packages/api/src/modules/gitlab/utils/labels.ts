import { type GitlabIssue } from '../index.js';
/**
 * Maps importance label names to their value, from 0 (lowest) and then increasing.
 */
export const ISSUE_IMPORTANCE_LABELS = {
  'importance:rockbottom': 0,
  'importance:low': 1,
  'importance:medium': 2,
  'importance:high': 3,
  'importance:urgent': 4,
};

/**
 * Maps difficulty label names to their value, from 0 (easiest) and then increasing.
 */
export const ISSUE_DIFFICULTY_LABELS = {
  'difficulty:braindead': 0,
  'difficulty:easy': 1,
  'difficulty:moderate': 2,
  'difficulty:hard': 3,
  'difficulty:unknown': 4,
};

export const difficultyOrImportanceFromLabel = (
  map: Record<string, number>,
  labels: GitlabIssue['labels'],
) => {
  const highestUnbounded = Math.max(
    ...labels.nodes.map((l) => map[l.title] ?? Number.NEGATIVE_INFINITY),
  );
  // eslint-disable-next-line unicorn/no-null
  if (highestUnbounded === Number.NEGATIVE_INFINITY) return null;
  return highestUnbounded / Object.values(map).length;
};
