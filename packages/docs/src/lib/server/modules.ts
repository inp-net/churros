import * as cheerio from 'cheerio';
import { readFile, readdir, stat } from 'node:fs/promises';
import * as path from 'path';
import { kebabToCamel, kebabToPascal } from '../casing';
import { markdownToHtml, type ResolverFromFilesystem } from '../markdown';

export type Module = {
	name: string;
	displayName: string;
	rawDocs: string;
	renderedDocs: string;
	queries: string[];
	mutations: string[];
	subscriptions: string[];
	types: string[];
};

async function readdirNotExistOk(directory: string): Promise<string[]> {
	if (!(await stat(directory).catch(() => false))) {
		console.warn(`WARN: ${directory} does not exist.`);
		return [];
	}
	const files = (await readdir(directory)).map((file) => path.join(directory, file));
	if (files.length === 0) {
		console.warn(`WARN: ${directory} is empty.`);
	}
	return files;
}

export async function getModule(directory: string): Promise<Module> {
	const folder = path.join('../api/new-src/modules', directory);
	if (!(await stat(folder).catch(() => false)))
		throw new Error(`Module ${directory} does not exist: ${folder} not found.`);
	const docs = await readFile(path.join(folder, 'README.md'), 'utf-8');

	const htmlDocs = await markdownToHtml(docs, await getAllResolvers(), {downlevelHeadings: false});
	const parsedDocs = cheerio.load(htmlDocs);
	const docsWithoutHeading = cheerio.load(htmlDocs);
	docsWithoutHeading('h1').remove();

	const module: Module = {
		name: directory,
		displayName: parsedDocs('h1').first().text(),
		docs,
		renderedDocs: docsWithoutHeading.html() ?? '',
		types: (await readdir(path.join(folder, 'types'))).map((file) =>
			kebabToPascal(path.basename(file, '.ts'))
		),
		queries: [],
		mutations: [],
		subscriptions: []
	};

	for (const filepath of await readdirNotExistOk(path.join(folder, 'resolvers'))) {
		const filename = path.basename(filepath);
		if (filename.startsWith('query')) {
			module.queries.push(kebabToCamel(filename.replace(/^query\./, '').replace(/\.ts$/, '')));
		}

		if (filename.startsWith('mutation')) {
			module.mutations.push(kebabToCamel(filename.replace(/^mutation\./, '').replace(/\.ts$/, '')));
		}

		if (filename.startsWith('subscription')) {
			module.subscriptions.push(
				kebabToCamel(filename.replace(/^subscription\./, '').replace(/\.ts$/, ''))
			);
		}
	}

	if (
		module.types.length === 0 &&
		module.queries.length === 0 &&
		module.mutations.length === 0 &&
		module.subscriptions.length === 0
	) {
		console.warn(
			`WARN: ${directory} has no types nor resolvers. Files found...\n\tIn ${path.join(
				folder,
				'types'
			)}: ${(await readdirNotExistOk(path.join(folder, 'types')))
				.map((f) => path.basename(f))
				.join(', ')}\n\tIn ${path.join(folder, 'resolvers')}: ${(
				await readdirNotExistOk(path.join(folder, 'resolvers'))
			)
				.map((f) => path.basename(f))
				.join(', ')}`
		);
	}

	return module;
}

let allResolvers: ResolverFromFilesystem[] = [];

export async function getAllResolvers(): Promise<ResolverFromFilesystem[]> {
	if (allResolvers.length > 0) {
		return allResolvers;
	}
	const modules = await readdirNotExistOk('../api/new-src/modules');
	const resolvers: ResolverFromFilesystem[] = [];
	for (const module of modules) {
		for (const resolver of await readdirNotExistOk(path.join(module, 'resolvers'))) {
			const rootResolverPrefix = /^(query|mutation|subscription)\./;
			if (rootResolverPrefix.test(path.basename(resolver))) {
				resolvers.push({
					name: kebabToCamel(
						path.basename(resolver).replace(rootResolverPrefix, '').replace(/\.ts$/, '')
					),
					moduleName: path.basename(module),
					type: path.basename(resolver).split('.')[0] as 'query' | 'mutation' | 'subscription'
				});
				console.log(
					`Found resolver ${path.basename(resolver)} in ${module}: ${JSON.stringify(
						resolvers.at(-1)
					)}`
				);
			}
		}
	}

	console.warn(
		`WARN: no resolvers found. Searched in ${modules
			.map((m) => path.join(m, 'resolvers'))
			.join(', ')}`
	);

	allResolvers = resolvers;
	return resolvers;
}
