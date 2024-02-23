import * as cheerio from 'cheerio';
import { readFile, readdir, stat } from 'node:fs/promises';
import * as path from 'path';
import { kebabToCamel, kebabToPascal } from '../casing';
import { getFrontmatter, markdownToHtml, type ResolverFromFilesystem } from '../markdown';
import { loadSchema } from './schema-loader';
import { MODULES_ORDER } from '$lib/ordering';

export type Module = {
	name: string;
	displayName: string;
	rawDocs: string;
	renderedDocs: string;
	shortDescription: string;
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

async function typescriptFilesWithoutBarrels(directory: string): Promise<string[]> {
	return (await readdirNotExistOk(directory)).filter(
		(file) => file.endsWith('.ts') && !file.endsWith('.d.ts') && path.basename(file) !== 'index.ts'
	);
}

function ellipsis(text: string, maxWords: number) {
	const words = text.split(' ');
	if (words.length <= maxWords) {
		return text;
	}
	return words.slice(0, maxWords).join(' ') + '...';
}

function firstSentence(text: string) {
	return text.split(/\.(\s|$)/)[0];
}

export async function getModule(directory: string): Promise<Module> {
	const folder = path.join('../api/src/modules', directory);
	if (!(await stat(folder).catch(() => false)))
		throw new Error(`Module ${directory} does not exist: ${folder} not found.`);
	const docs = await readFile(path.join(folder, 'README.md'), 'utf-8');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const metadata: Record<string, any> = await getFrontmatter(docs);
	const htmlDocs = await markdownToHtml(docs, await getAllResolvers(), {
		downlevelHeadings: false
	});
	const parsedDocs = cheerio.load(htmlDocs);
	const docsWithoutHeading = cheerio.load(htmlDocs);
	docsWithoutHeading('h1').remove();

	if (Object.keys(metadata).length > 0) {
		console.log(`Found metadata for ${directory}: ${JSON.stringify(metadata)}`);
	}

	const module: Module = {
		name: directory,
		displayName: parsedDocs('h1').first().text(),
		rawDocs: docs,
		shortDescription: ellipsis(firstSentence(docsWithoutHeading('p').first().text()), 15),
		renderedDocs: docsWithoutHeading.html() ?? '',
		types: (await typescriptFilesWithoutBarrels(path.join(folder, 'types'))).map((file) =>
			kebabToPascal(path.basename(file, '.ts'))
		),
		queries: [],
		mutations: [],
		subscriptions: []
	};

	for (const filepath of await typescriptFilesWithoutBarrels(path.join(folder, 'resolvers'))) {
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

	if (metadata.manually_include) {
		for (const query of metadata.manually_include.queries ?? []) {
			module.queries.push(query);
		}
		for (const mutation of metadata.manually_include.mutations ?? []) {
			module.mutations.push(mutation);
		}
		for (const subscription of metadata.manually_include.subscriptions ?? []) {
			module.subscriptions.push(subscription);
		}
		for (const type of metadata.manually_include.types ?? []) {
			module.types.push(type);
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
			)}: ${(await typescriptFilesWithoutBarrels(path.join(folder, 'types')))
				.map((f) => path.basename(f))
				.join(', ')}\n\tIn ${path.join(folder, 'resolvers')}: ${(
				await typescriptFilesWithoutBarrels(path.join(folder, 'resolvers'))
			)
				.map((f) => path.basename(f))
				.join(', ')}`
		);
	}

	return module;
}

export async function getAllModules() {
	return (
		await Promise.all(
			(await readdir('../api/src/modules')).map(async (folder) => getModule(folder))
		)
	).sort((a, b) => MODULES_ORDER.indexOf(a.name) - MODULES_ORDER.indexOf(b.name));
}

let allResolvers: ResolverFromFilesystem[] = [];

export async function getAllResolvers(): Promise<ResolverFromFilesystem[]> {
	if (allResolvers.length > 0) {
		return allResolvers;
	}
	const modules = await readdirNotExistOk('../api/src/modules');
	const resolvers: ResolverFromFilesystem[] = [];
	for (const module of modules) {
		for (const resolver of await typescriptFilesWithoutBarrels(path.join(module, 'resolvers'))) {
			const rootResolverPrefix = /^(query|mutation|subscription)\./;
			if (rootResolverPrefix.test(path.basename(resolver))) {
				resolvers.push({
					name: kebabToCamel(
						path.basename(resolver).replace(rootResolverPrefix, '').replace(/\.ts$/, '')
					),
					moduleName: path.basename(module),
					type: path.basename(resolver).split('.')[0] as 'query' | 'mutation' | 'subscription'
				});
				// console.log(
				// 	`Found resolver ${path.basename(resolver)} in ${module}: ${JSON.stringify(
				// 		resolvers.at(-1)
				// 	)}`
				// );
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

const BUILTIN_TYPES = ['String', 'Boolean', 'Int', 'Float'];

export async function indexModule(): Promise<Module> {
	const schema = await loadSchema();
	return {
		displayName: 'Index',
		name: 'index',
		mutations:
			schema.types
				.find((type) => type.name === (schema.mutationType ?? { name: '' }).name)
				?.fields?.map((field) => field.name) ?? [],
		queries:
			schema.types
				.find((type) => type.name === schema.queryType.name)
				?.fields?.map((field) => field.name) ?? [],
		subscriptions:
			schema.types
				.find((type) => type.name === (schema.subscriptionType ?? { name: '' })?.name)
				?.fields?.map((field) => field.name) ?? [],
		rawDocs: 'Le schéma GraphQL entier',
		renderedDocs: 'Le schéma GraphQL entier',
		shortDescription: 'Le schéma GraphQL entier',
		types: schema.types
			.map((t) => t.name)
			.filter(
				(n) =>
					![
						schema.queryType.name,
						(schema.mutationType ?? { name: '' }).name,
						(schema.subscriptionType ?? { name: '' })?.name
					].includes(n) &&
					!BUILTIN_TYPES.includes(n) /* &&
					!/(Connection|Edge|Success)$/.test(n) */ &&
					!n.startsWith('__') /* &&
					!/^(Query|Mutation|Subscription)\w+(Result|Success)$/.test(n) */
			)
	} as Module;
}
