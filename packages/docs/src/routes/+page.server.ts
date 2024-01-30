import { MODULES_ORDER } from '$lib/ordering';
import { getModule } from '$lib/server/modules';
import { loadSchema } from '$lib/server/schema-loader';
import { readdir } from 'node:fs/promises';

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
