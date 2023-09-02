import rehypeSanitize from 'rehype-sanitize';
import { htmlToText as convertHtmlToText } from 'html-to-text';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

/** Converts markdown to HTML. */
export const toHtml = async (body: string) =>
  unified()
    .use(remarkParse)
    // Downlevel titles (h1 -> h3)
    .use(() => ({ children }) => {
      for (const child of children)
        if (child.type === 'heading') child.depth = Math.min(child.depth + 2, 6) as 3 | 4 | 5 | 6;
    })
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(body.replace(/\n/g, '\n\n'))
    .then(String);
// .then((s) =>
//   s.replaceAll(
//     /(^|\b|\s)@(\w+)(\b|\s|$)/g,
//     (_, before: string, uid: string, after: string) =>
//       `${before}<a href="/users/${uid}" class="user-mention">@${uid}</a>${after}`
//   )
// );

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
