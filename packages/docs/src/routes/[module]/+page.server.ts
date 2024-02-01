import { getAllModules, getModule, indexModule } from '$lib/server/modules';
import { loadSchema } from '$lib/server/schema-loader';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		return {
			schema: await loadSchema(),
			modules:
				params.module === 'all'
					? await getAllModules()
					: params.module === 'index'
						? [await indexModule()]
						: [await getModule(params.module)]
		};
	} catch (err) {
		error(404, { message: `Module ${params.module} inexistant` });
	}
}
