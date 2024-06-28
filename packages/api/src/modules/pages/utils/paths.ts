import type { Page } from '@churros/db/prisma';
import path from 'node:path/posix';

export function withTrailingSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

export function withoutTrailingSlash(path: string) {
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function pageFilePath(
  page: Page,
  file: { name: string },
): { filepath: string; relativePath: string; root: string } {
  const root = new URL(process.env.STORAGE).pathname;
  const filepath = path.join(root, 'pages', page.id, file.name.trim());
  const relativePath = path.relative(root, filepath);
  return { filepath, root, relativePath };
}
