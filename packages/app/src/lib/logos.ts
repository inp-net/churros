import { env } from '$env/dynamic/public';

/**
 * Get the complete path to the group's picture
 * @param $isDark Are we in a dark theme?
 * @param group The group's picture files. If a picture file starts with a double slash, the path will not be prefixed with PUBLIC_STORAGE_URL
 * @returns The complete path to the group's picture, ready to use as an src on an <img> tag
 */
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
