import { getModule } from '$lib/server/modules';
import { loadSchema } from '$lib/server/schema-loader';
import { readdir } from 'node:fs/promises';

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
	const schema = await loadSchema();
	return {
		schema,
		modules: (
			await Promise.all(
				(await readdir('../api/new-src/modules')).map(async (folder) => getModule(folder))
			)
		).sort((a, b) => MODULES_ORDER.indexOf(a.name) - MODULES_ORDER.indexOf(b.name))
	};
}
