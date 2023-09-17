import { env } from '$env/dynamic/public';

export function groupLogoSrc(
  $isDark: boolean,
  group: { pictureFile: string; pictureFileDark: string },
): string {
  if ($isDark && group.pictureFileDark) return `${env.PUBLIC_STORAGE_URL}${group.pictureFileDark}`;
  if (group.pictureFile) return `${env.PUBLIC_STORAGE_URL}${group.pictureFile}`;

  return '';
}
