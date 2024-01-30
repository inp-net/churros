import { readFile, readdir, stat } from 'node:fs/promises';
import * as path from 'path';
import { kebabToCamel, kebabToPascal } from '../casing';
import * as cheerio from 'cheerio';
import { markdownToHtml } from '$lib/markdown';

export type Module = {
	name: string;
	displayName: string;
	docs: string;
	queries: string[];
	mutations: string[];
	subscriptions: string[];
	types: string[];
};

async function readdirNotExistOk(directory: string): Promise<string[]> {
	if (!(await stat(directory).catch(() => false))) return [];
	return (await readdir(directory)).map((file) => path.join(directory, file));
}

export async function getModule(directory: string): Promise<Module> {
	const folder = path.join('../api/new-src/modules', directory);
	if (!(await stat(folder).catch(() => false)))
		throw new Error(`Module ${directory} does not exist: ${folder} not found.`);
	const docs = await readFile(path.join(folder, 'README.md'), 'utf-8');

	const parsedDocs = cheerio.load(await markdownToHtml(docs));

	const module: Module = {
		name: directory,
		displayName: parsedDocs('h2').first().text(),
		docs,
		types: (await readdir(path.join(folder, 'types'))).map((file) =>
			kebabToPascal(file.replace('.ts', ''))
		),
		queries: [],
		mutations: [],
		subscriptions: []
	};

	for (const filename of await readdirNotExistOk(path.join(folder, 'resolvers'))) {
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

	return module;
}
