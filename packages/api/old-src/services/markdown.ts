import { htmlToText as convertHtmlToText } from 'html-to-text';
import linkifyHtml from 'linkify-html';
import 'linkify-plugin-mention';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkBreaks from 'remark-breaks';
//@ts-expect-error Untyped library
import remarkGitlab from 'remark-gitlab';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

/** Converts markdown to HTML. */
export const toHtml = async (
  body: string,
  options?: { linkifyUserMentions: boolean; linkifyGitlabItems: boolean },
) =>
  linkifyHtml(
    await unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkBreaks)
      .use(options?.linkifyGitlabItems ? remarkGitlab : () => {}, {
        repository: 'https://git.inpt.fr/inp-net/churros',
      })
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
      .then((s) =>
        options?.linkifyGitlabItems
          ? String(s).replaceAll(
              /https:\/\/git.inpt.fr\/inp-net\/(?:churros|centraverse)\/(?:-\/)?issues\/(\d+)/g,
              '/reports/$1',
            )
          : String(s),
      ),
    {
      defaultProtocol: 'https',
      attributes: {
        'data-external-link': 'data-external-link',
      },
      formatHref: {
        mention:
          options?.linkifyUserMentions ?? true
            ? (username) => `https://churros.inpt.fr/@${username.replace(/^\//, '')}`
            : (u) => u,
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
