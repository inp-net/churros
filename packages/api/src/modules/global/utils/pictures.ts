import { ENV } from '#lib';
import path from 'node:path';

export function pictureURL({
  dark,
  pictureFile,
  pictureFileDark,
  updatedAt,
  timestamp = true,
}: {
  dark?: boolean;
  pictureFile: string;
  pictureFileDark?: string | null;
  updatedAt?: Date | null;
  timestamp?: boolean;
}) {
  const filepath = dark ? pictureFileDark || pictureFile : pictureFile;
  if (!filepath) return '';

  let result = new URL(ENV.PUBLIC_STORAGE_URL);

  if (ENV.PUBLIC_API_ORIGIN_WEB)
    result = new URL(result.toString().replace(result.origin, ENV.PUBLIC_API_ORIGIN_WEB));

  result.pathname = path.join(result.pathname, filepath);
  if (timestamp) result.searchParams.set('t', (updatedAt?.getTime() ?? Date.now()).toString());

  return result.toString();
}
