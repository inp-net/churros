import 'linkify-plugin-mention';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { camelToKebab } from './casing';
import { matter } from 'vfile-matter';

export type ResolverFromFilesystem = {
	name: string;
	moduleName: string;
	type: 'query' | 'mutation' | 'subscription';
};

export async function getFrontmatter(markdown: string) {
	return await unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeStringify)
		.use(remarkFrontmatter)
		.use(() => (_, file) => {
			matter(file);
		})
		.process(markdown)
		.then((file) => (file.data.matter ?? {}) as Record<string, unknown>);
}

export async function markdownToHtml(
	markdown: string,
	allResolvers: ResolverFromFilesystem[] = [],
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	{ downlevelHeadings = true } = {}
) {
	return await unified()
		.use(remarkParse)
		.use(() => ({ children }) => {
			if (downlevelHeadings)
				for (const child of children) {
					if (child.type === 'heading')
						child.depth = Math.min(child.depth + 1, 6) as 2 | 3 | 4 | 5 | 6;
				}
		})
		.use(remarkRehype)
		.use(rehypeStringify)
		.use(remarkFrontmatter)
		.process(markdown)
		.then(String)
		.then((html) =>
			html
				// auto-link "query foo", "mutation bar", and "subscription baz"
				.replaceAll(/(query|mutation|subscription) ([a-zA-Z0-9]+)/g, (match, type, name) => {
					const r = allResolvers.find((r) => r.name === name && r.type === type);
					return r ? `<a href="/${r.moduleName}#${r.type}/${r.name}">${r.name}</a>` : match;
				})
				// auto-link "registerApp" but not "user"
				.split(' ')
				.map((word) => {
					const r = allResolvers.find((r) => r.name === word && camelToKebab(r.name).includes('-'));
					return r ? `<a href="/${r.moduleName}#${r.type}/${r.name}">${word}</a>` : word;
				})
				.join(' ')
		);
}
