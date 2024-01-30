import { getModule } from '$lib/server/modules';
import { Convert } from '$lib/schema';
import { readFile, readdir } from 'node:fs/promises';

const MODULES_ORDER = [
	'users',
	'groups',
	'posts',
	'events',
	'ticketing',
	'documents',
	'services',
	'bar-weeks',
	'student-associations',
	'schools',
	'curriculum',
	'comments',
	'reactions',
	'links',
	'oauth',
	'announcements',
	'gitlab',
	'changelogs',
	'logs',
	'health-checks'
];

export async function load() {
	return {
		schema: Convert.toSchema(await readFile('src/lib/server/schema.json', 'utf-8')),
		modules: (
			await Promise.all(
				(await readdir('../api/new-src/modules')).map(async (folder) => getModule(folder))
			)
		).sort((a, b) => MODULES_ORDER.indexOf(a.name) - MODULES_ORDER.indexOf(b.name))
	};
}
