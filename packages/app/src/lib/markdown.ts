import { htmlToText as convertHtmlToText } from 'html-to-text';

export function htmlToText(body: string): string {
  return convertHtmlToText(body, {
    selectors: [
      {
        selector: 'a',
        options: {
          ignoreHref: true,
        },
      },
    ],
  });
}
