import { env } from '$env/dynamic/public';

export function groupLogoSrc(
  $isDark: boolean,
  group: { pictureFile: string; pictureFileDark: string },
): string {
  const prefix = (path: string) =>
    path.startsWith('//') ? path.replace('//', '/') : `${env.PUBLIC_STORAGE_URL}${path}`;

  if ($isDark && group.pictureFileDark) return prefix(group.pictureFileDark);
  if (group.pictureFile) return prefix(group.pictureFile);

  return '';
}
