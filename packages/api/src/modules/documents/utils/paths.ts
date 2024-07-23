import path from 'node:path';

export function documentFilePath(
  root: string,
  subject:
    | { id: string; name: string; slug: string; shortName: string; nextExamAt: Date | null }
    | undefined
    | null,
  document: { slug: string; solutionPaths: string[]; paperPaths: string[] },
  solution: boolean,
  file: { name: string },
) {
  return path.join(
    root,
    'documents',
    subject?.slug ?? 'unknown',
    document.slug,
    `${document[solution ? 'solutionPaths' : 'paperPaths'].length}-${file.name}`,
  );
}
