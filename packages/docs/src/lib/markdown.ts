import 'linkify-plugin-mention';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export async function markdownToHtml(markdown: string) {
	return await unified()
		.use(remarkParse)
		.use(() => ({ children }) => {
			for (const child of children) {
				if (child.type === 'heading')
					child.depth = Math.min(child.depth + 1, 6) as 2 | 3 | 4 | 5 | 6;
			}
		})
		.use(remarkRehype)
		.use(rehypeStringify)
		.process(markdown)
		.then(String);
}
