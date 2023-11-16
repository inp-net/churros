import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { htmlToText as convertHtmlToText } from 'html-to-text';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import linkifyHtml from 'linkify-html';
import 'linkify-plugin-mention';

/** Converts markdown to HTML. */
export const toHtml = async (body: string) =>
  linkifyHtml(
    await unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkBreaks)
      // Downlevel titles (h1 -> h3)
      .use(() => ({ children }) => {
        for (const child of children)
          if (child.type === 'heading') child.depth = Math.min(child.depth + 2, 6) as 3 | 4 | 5 | 6;
      })
      .use(remarkRehype)
      .use(rehypeSanitize, {
        ...defaultSchema,
        attributes: {
          ...defaultSchema.attributes,
          code: [['className', /^language-./, 'math-inline', 'math-display']],
          span: [...(defaultSchema.attributes?.['span'] || []), ['className', /^hljs-./]],
        },
      })
      .use(rehypeKatex)
      .use(rehypeHighlight)
      .use(rehypeStringify)
      .process(body)
      .then(String),
    {
      defaultProtocol: 'https',
      attributes: {
        'data-external-link': 'data-external-link',
      },
      formatHref: {
        mention: (username) => `https://churros.inpt.fr/@${username.replace(/^\//, '')}`,
      },
    },
  );

export function htmlToText(body: string): string {
  return convertHtmlToText(body, {
    selectors: [
      {
        selector: 'a',
        options: {
          ignoreHref: true,
        },
      },
      ...[1, 2, 3, 4, 5, 6].map((i) => ({
        selector: `h${i}`,
        options: {
          uppercase: false,
        },
      })),
    ],
  });
}
