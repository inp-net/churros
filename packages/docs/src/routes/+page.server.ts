import { getAllModules } from '$lib/server/modules';
import { loadSchema } from '$lib/server/schema-loader';

export async function load() {
	return {
		schema: await loadSchema(),
		modules: await getAllModules()
	};
}
