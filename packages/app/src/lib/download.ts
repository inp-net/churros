import { browser } from '$app/environment';

/**
 * Save a string as a file from the browser
 * @param filename the filename to save as
 * @param contents text contents of the file
 * @param contentType MIME content type
 * @returns nothing
 */
export function saveStringAsFile(
  filename: string,
  contents: string,
  contentType: `${'text' | 'application'}/${string}`,
) {
  if (!browser) return;

  const link = document.createElement('a') as HTMLAnchorElement;
  const contentURL = URL.createObjectURL(
    new Blob([contents], {
      type: contentType,
    }),
  );

  link.setAttribute('href', contentURL);
  link.setAttribute('download', filename);
  link.style.display = 'none';

  document.body.append(link);
  link.click();

  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(contentURL);
  }, 100);
}
