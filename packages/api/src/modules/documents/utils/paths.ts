import path from 'node:path';

export function documentFilePath(
  root: string,
  subject:
    | { id: string; name: string; uid: string; shortName: string; nextExamAt: Date | null }
    | undefined
    | null,
  document: { uid: string; solutionPaths: string[]; paperPaths: string[] },
  solution: boolean,
  file: { name: string },
) {
  return path.join(
    root,
    'documents',
    subject?.uid ?? 'unknown',
    document.uid,
    `${document[solution ? 'solutionPaths' : 'paperPaths'].length}-${file.name}`,
  );
}
